import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface InventoryUpdate {
  villaCategory: string;
  date: string;
  availability: number;
  source?: string;
}

// HTTPS endpoint (not callable) — receives webhook from Kafka consumer bridge
export const kafkaInventoryWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // In production: verify webhook signature
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers["x-webhook-signature"];
    if (sig !== secret) {
      res.status(401).send("Unauthorized");
      return;
    }
  }

  const updates = Array.isArray(req.body) ? req.body as InventoryUpdate[] : [req.body as InventoryUpdate];
  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();

  for (const update of updates) {
    if (!update.villaCategory || !update.date) continue;

    const docId = `${update.villaCategory}_${update.date}`;
    const ref = db.collection("inventory").doc(docId);
    batch.set(ref, {
      villaCategory: update.villaCategory,
      date: update.date,
      availability: update.availability,
      source: update.source ?? "kafka",
      updatedAt: now,
    }, { merge: true });

    // Also update the rate doc for the matching villa
    batch.set(db.collection("audit_logs").doc(), {
      action: "inventory_updated",
      entityType: "inventory",
      entityId: docId,
      userId: "webhook",
      metadata: { availability: update.availability },
      timestamp: now,
    });
  }

  await batch.commit();

  functions.logger.info("kafka:inventory-updates:processed", { count: updates.length });
  res.status(200).json({ success: true, processed: updates.length });
});
