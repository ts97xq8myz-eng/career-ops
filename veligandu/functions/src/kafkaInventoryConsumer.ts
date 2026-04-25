import { logger } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { Kafka, logLevel, KafkaMessage } from "kafkajs";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const TOPIC = "veligandu.inventory.live";
const GROUP  = "veligandu-functions-inventory";

interface InventoryMessage {
  villaCategory: string;
  date: string;
  available: number;
  totalRooms?: number;
  heldRooms?: number;
  source?: string;
  timestamp?: string;
}

function buildKafka() {
  const brokers = (process.env.KAFKA_BROKERS ?? "").split(",").filter(Boolean);
  if (!brokers.length) throw new Error("KAFKA_BROKERS not configured");

  return new Kafka({
    clientId: "veligandu-inventory-consumer",
    brokers,
    logLevel: logLevel.WARN,
    ...(process.env.KAFKA_SASL_USERNAME && {
      ssl: true,
      sasl: {
        mechanism: "plain",
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD ?? "",
      },
    }),
  });
}

async function processMessage(msg: KafkaMessage, batch: admin.firestore.WriteBatch) {
  if (!msg.value) return;

  let payload: InventoryMessage;
  try {
    payload = JSON.parse(msg.value.toString()) as InventoryMessage;
  } catch {
    logger.warn("kafka:inventory — invalid JSON, skipping");
    return;
  }

  const { villaCategory, date, available } = payload;
  if (!villaCategory || !date || typeof available !== "number") {
    logger.warn("kafka:inventory — missing required fields", { payload });
    return;
  }

  // Per-date inventory doc
  const dateDocId = `${villaCategory}_${date}`;
  batch.set(db.collection("inventory").doc(dateDocId), {
    villaCategory,
    date,
    available,
    totalRooms: payload.totalRooms  ?? available,
    heldRooms:  payload.heldRooms   ?? 0,
    source:     "kafka",
    kafkaOffset: msg.offset,
    producedAt: payload.timestamp   ?? new Date().toISOString(),
    updatedAt:  admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  // Category-level summary (min availability across next 30 days)
  // We update the summary doc by always writing; the frontend reads
  // inventory/{villaCategory} for the quick summary view
  const summaryRef = db.collection("inventory_summary").doc(villaCategory);
  batch.set(summaryRef, {
    villaCategory,
    // We can only update with current message value; full aggregation
    // is done by the webhook which receives all updates at once
    available,
    nextDate:    date,
    source:      "kafka",
    updatedAt:   admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  batch.set(db.collection("kafka_events").doc(), {
    topic:         TOPIC,
    offset:        msg.offset,
    villaCategory,
    date,
    available,
    action:        "inventory_updated",
    processedAt:   admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Runs every minute via Cloud Scheduler
export const kafkaInventoryConsumer = onSchedule(
  { schedule: "every 1 minutes", timeoutSeconds: 120, memory: "256MiB" },
  async () => {
    if (!process.env.KAFKA_BROKERS) {
      logger.info("kafka:inventory — KAFKA_BROKERS not set, skipping");
      return;
    }

    const kafka    = buildKafka();
    const consumer = kafka.consumer({ groupId: GROUP, sessionTimeout: 30000 });

    try {
      await consumer.connect();
      await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

      const messages: KafkaMessage[] = [];
      await consumer.run({ eachMessage: async ({ message }) => { messages.push(message); } });
      await new Promise((resolve) => setTimeout(resolve, 15_000));
      await consumer.stop();

      if (!messages.length) {
        logger.info("kafka:inventory — no new messages");
        return;
      }

      const batch = db.batch();
      for (const msg of messages) await processMessage(msg, batch);
      await batch.commit();

      logger.info("kafka:inventory — processed", { count: messages.length });
    } catch (err) {
      logger.error("kafka:inventory — consumer error", { err });
    } finally {
      await consumer.disconnect().catch(() => {});
    }
  }
);
