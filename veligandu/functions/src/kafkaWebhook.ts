/**
 * kafkaWebhook — HTTP endpoint for Confluent Cloud HTTP Sink Connector.
 *
 * Configure the Confluent HTTP Sink Connector to POST to:
 *   https://us-central1-veligandu-3cc65.cloudfunctions.net/kafkaWebhook
 *
 * It handles:
 *   - Confluent HTTP Sink envelope (array of {topic, key, value, ...})
 *   - Direct JSON arrays of rate/inventory messages
 *   - Single rate/inventory message objects
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const RATES_TOPIC     = "veligandu.rates.live";
const INVENTORY_TOPIC = "veligandu.inventory.live";
const BOOKINGS_TOPIC  = "veligandu.bookings.confirmed";

interface RateRecord {
  villaCategory: string;
  directRate: number;
  publicRate?: number;
  currency?: string;
  mealPlan?: string;
  dateFrom?: string;
  dateTo?: string;
  availability?: number;
  minStay?: number;
  source?: string;
  timestamp?: string;
}

interface InventoryRecord {
  villaCategory: string;
  date: string;
  available: number;
  totalRooms?: number;
  heldRooms?: number;
  source?: string;
  timestamp?: string;
}

interface BookingRecord {
  bookingId: string;
  villaCategory: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rateApplied?: number;
  source?: string;
  timestamp?: string;
}

interface ConfluentRecord {
  topic: string;
  key: string | null;
  value: string;
  partition?: number;
  offset?: number;
}

function verifySignature(req: functions.https.Request): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return true; // no secret configured → allow

  const sig = req.headers["x-webhook-signature"] as string | undefined
            ?? req.headers["x-hub-signature-256"] as string | undefined;
  if (!sig) return false;

  // Support both plain token and HMAC-SHA256
  if (sig === secret) return true;

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return sig === `sha256=${hmac}` || sig === hmac;
}

async function processRateRecord(
  record: RateRecord,
  batch: admin.firestore.WriteBatch,
  meta: { topic: string; offset?: number }
) {
  if (!record.villaCategory || typeof record.directRate !== "number") return;

  batch.set(db.collection("rates").doc(record.villaCategory), {
    villaCategory:  record.villaCategory,
    directRate:     record.directRate,
    publicRate:     record.publicRate     ?? null,
    currency:       record.currency       ?? "USD",
    mealPlan:       record.mealPlan       ?? "BB",
    dateFrom:       record.dateFrom       ?? null,
    dateTo:         record.dateTo         ?? null,
    availability:   record.availability   ?? 5,
    minStay:        record.minStay        ?? 1,
    source:         "kafka",
    kafkaTopic:     meta.topic,
    kafkaOffset:    meta.offset           ?? null,
    producedAt:     record.timestamp      ?? new Date().toISOString(),
    updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function processInventoryRecord(
  record: InventoryRecord,
  batch: admin.firestore.WriteBatch,
  meta: { topic: string; offset?: number }
) {
  if (!record.villaCategory || !record.date || typeof record.available !== "number") return;

  const dateDocId = `${record.villaCategory}_${record.date}`;

  batch.set(db.collection("inventory").doc(dateDocId), {
    villaCategory:  record.villaCategory,
    date:           record.date,
    available:      record.available,
    totalRooms:     record.totalRooms   ?? record.available,
    heldRooms:      record.heldRooms    ?? 0,
    source:         "kafka",
    kafkaTopic:     meta.topic,
    kafkaOffset:    meta.offset         ?? null,
    producedAt:     record.timestamp    ?? new Date().toISOString(),
    updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  // Update summary
  batch.set(db.collection("inventory_summary").doc(record.villaCategory), {
    villaCategory:  record.villaCategory,
    available:      record.available,
    nextDate:       record.date,
    source:         "kafka",
    updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function processBookingRecord(
  record: BookingRecord,
  batch: admin.firestore.WriteBatch
) {
  if (!record.villaCategory || !record.checkIn || !record.checkOut) return;

  batch.set(db.collection("kafka_events").doc(record.bookingId || db.collection("kafka_events").doc().id), {
    topic:          BOOKINGS_TOPIC,
    action:         "booking_confirmed",
    bookingId:      record.bookingId    ?? null,
    villaCategory:  record.villaCategory,
    checkIn:        record.checkIn,
    checkOut:       record.checkOut,
    guests:         record.guests       ?? 2,
    rateApplied:    record.rateApplied  ?? null,
    source:         record.source       ?? "kafka",
    producedAt:     record.timestamp    ?? new Date().toISOString(),
    processedAt:    admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

function detectTopic(record: Record<string, unknown>): string {
  if (typeof record.directRate === "number") return RATES_TOPIC;
  if (typeof record.available === "number" && typeof record.date === "string") return INVENTORY_TOPIC;
  if (typeof record.bookingId === "string") return BOOKINGS_TOPIC;
  return "";
}

export const kafkaWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  if (!verifySignature(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const body = req.body;
  const batch = db.batch();
  let processed = 0;
  const now = new Date().toISOString();

  try {
    // ── Confluent HTTP Sink envelope ──────────────────────────────────────────
    if (Array.isArray(body) && body[0]?.topic !== undefined && body[0]?.value !== undefined) {
      for (const record of body as ConfluentRecord[]) {
        let payload: Record<string, unknown>;
        try { payload = JSON.parse(record.value); } catch { continue; }

        const topic = record.topic;
        if (topic === RATES_TOPIC) {
          await processRateRecord(payload as unknown as RateRecord, batch, { topic, offset: record.offset });
        } else if (topic === INVENTORY_TOPIC) {
          await processInventoryRecord(payload as unknown as InventoryRecord, batch, { topic, offset: record.offset });
        } else if (topic === BOOKINGS_TOPIC) {
          await processBookingRecord(payload as unknown as BookingRecord, batch);
        }
        processed++;
      }
    }
    // ── Direct array of rate/inventory records ────────────────────────────────
    else if (Array.isArray(body)) {
      for (const record of body as Record<string, unknown>[]) {
        const topic = detectTopic(record);
        if (topic === RATES_TOPIC) {
          await processRateRecord(record as unknown as RateRecord, batch, { topic });
        } else if (topic === INVENTORY_TOPIC) {
          await processInventoryRecord(record as unknown as InventoryRecord, batch, { topic });
        } else if (topic === BOOKINGS_TOPIC) {
          await processBookingRecord(record as unknown as BookingRecord, batch);
        }
        processed++;
      }
    }
    // ── Single record ─────────────────────────────────────────────────────────
    else {
      const bodyRecord = body as Record<string, unknown>;
      const topic = detectTopic(bodyRecord);
      if (topic === RATES_TOPIC) {
        await processRateRecord(bodyRecord as unknown as RateRecord, batch, { topic });
      } else if (topic === INVENTORY_TOPIC) {
        await processInventoryRecord(bodyRecord as unknown as InventoryRecord, batch, { topic });
      } else if (topic === BOOKINGS_TOPIC) {
        await processBookingRecord(bodyRecord as unknown as BookingRecord, batch);
      }
      processed = 1;
    }

    // Write Kafka receipt log
    batch.set(db.collection("kafka_webhook_log").doc(), {
      receivedAt:    now,
      processed,
      processedAt:   admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();
    functions.logger.info("kafkaWebhook:processed", { processed });
    res.status(200).json({ success: true, processed });
  } catch (err) {
    functions.logger.error("kafkaWebhook:error", { err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Expose old name as alias for backwards compat
export { kafkaWebhook as kafkaInventoryWebhook };
