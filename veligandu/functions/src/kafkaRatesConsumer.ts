import { logger } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { Kafka, logLevel, KafkaMessage } from "kafkajs";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const TOPIC = "veligandu.rates.live";
const GROUP  = "veligandu-functions-rates";

interface RateMessage {
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

function buildKafka() {
  const brokers = (process.env.KAFKA_BROKERS ?? "").split(",").filter(Boolean);
  if (!brokers.length) throw new Error("KAFKA_BROKERS not configured");

  const kafka = new Kafka({
    clientId: "veligandu-rates-consumer",
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
  return kafka;
}

async function getLastOffset(category: string): Promise<string | undefined> {
  const snap = await db.collection("kafka_offsets").doc(`rates_${category}`).get();
  return snap.exists ? snap.data()?.offset as string : undefined;
}

async function saveOffset(category: string, offset: string) {
  await db.collection("kafka_offsets").doc(`rates_${category}`).set({
    topic: TOPIC,
    partition: 0,
    offset,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function processMessage(msg: KafkaMessage, batch: admin.firestore.WriteBatch) {
  if (!msg.value) return;

  let payload: RateMessage;
  try {
    payload = JSON.parse(msg.value.toString()) as RateMessage;
  } catch {
    logger.warn("kafka:rates — invalid JSON, skipping", { offset: msg.offset });
    return;
  }

  const { villaCategory, directRate } = payload;
  if (!villaCategory || typeof directRate !== "number") {
    logger.warn("kafka:rates — missing required fields", { payload });
    return;
  }

  const rateRef = db.collection("rates").doc(villaCategory);
  batch.set(rateRef, {
    villaCategory,
    directRate,
    publicRate:    payload.publicRate    ?? null,
    currency:      payload.currency      ?? "USD",
    mealPlan:      payload.mealPlan      ?? "BB",
    dateFrom:      payload.dateFrom      ?? null,
    dateTo:        payload.dateTo        ?? null,
    availability:  payload.availability  ?? 5,
    minStay:       payload.minStay       ?? 1,
    source:        "kafka",
    kafkaOffset:   msg.offset,
    kafkaTopic:    TOPIC,
    producedAt:    payload.timestamp     ?? new Date().toISOString(),
    updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  // Audit trail
  batch.set(db.collection("kafka_events").doc(), {
    topic:         TOPIC,
    offset:        msg.offset,
    villaCategory,
    directRate,
    action:        "rate_updated",
    processedAt:   admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Runs every minute via Cloud Scheduler
export const kafkaRatesConsumer = onSchedule(
  { schedule: "every 1 minutes", timeoutSeconds: 120, memory: "256MiB" },
  async () => {
    if (!process.env.KAFKA_BROKERS) {
      logger.info("kafka:rates — KAFKA_BROKERS not set, skipping");
      return;
    }

    const kafka    = buildKafka();
    const consumer = kafka.consumer({ groupId: GROUP, sessionTimeout: 30000 });

    try {
      await consumer.connect();
      await consumer.subscribe({ topic: TOPIC, fromBeginning: false });

      const messages: KafkaMessage[] = [];

      await consumer.run({
        eachMessage: async ({ message }) => {
          messages.push(message);
        },
      });

      // Give the consumer 15s to collect messages then stop
      await new Promise((resolve) => setTimeout(resolve, 15_000));
      await consumer.stop();

      if (!messages.length) {
        logger.info("kafka:rates — no new messages");
        return;
      }

      // Write all updates in a single Firestore batch
      const batch = db.batch();
      for (const msg of messages) {
        await processMessage(msg, batch);
      }
      await batch.commit();

      logger.info("kafka:rates — processed", { count: messages.length });
    } catch (err) {
      logger.error("kafka:rates — consumer error", { err });
    } finally {
      await consumer.disconnect().catch(() => {});
    }
  }
);
