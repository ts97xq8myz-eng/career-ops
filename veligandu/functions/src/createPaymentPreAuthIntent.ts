import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface PreAuthInput {
  leadId: string;
  amount: number;
  currency?: string;
}

export const createPaymentPreAuthIntent = functions.https.onCall(async (request) => {
  const { leadId, amount, currency = "USD" } = request.data as PreAuthInput;

  if (!leadId || !amount) {
    throw new functions.https.HttpsError("invalid-argument", "leadId and amount are required");
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;

  let clientSecret: string;
  let intentId: string;

  if (stripeKey) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: currency.toLowerCase(),
      capture_method: "manual",
      metadata: { leadId },
      description: `Veligandu pre-auth for lead ${leadId}`,
    });

    clientSecret = intent.client_secret ?? "";
    intentId = intent.id;
  } else {
    // Mock pre-auth — no real charge
    clientSecret = `pi_mock_${Date.now()}_secret_mock`;
    intentId = `pi_mock_${Date.now()}`;
    functions.logger.info("payment:preauth:mock", { leadId, amount, currency });
  }

  // Update lead doc
  await db.collection("leads").doc(leadId).update({
    paymentIntentId: intentId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Audit log
  await db.collection("audit_logs").add({
    action: "payment_preauth_created",
    entityType: "payment",
    entityId: intentId,
    userId: "guest",
    metadata: { leadId, amount, currency },
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.info("kafka:payment-preauth-created", { leadId, intentId, amount });

  return { clientSecret, intentId, amount, currency };
});
