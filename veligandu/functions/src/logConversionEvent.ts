import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

interface ConversionInput {
  leadId: string;
  villaCategory: string;
  value?: number;
  currency?: string;
  utmSource?: string;
  utmCampaign?: string;
  gclid?: string;
}

export const logConversionEvent = functions.https.onCall(async (request) => {
  const data = request.data as ConversionInput;
  const now = admin.firestore.FieldValue.serverTimestamp();

  const convRef = await db.collection("conversions").add({
    ...data,
    currency: data.currency ?? "USD",
    timestamp: now,
    source: "web",
  });

  await db.collection("audit_logs").add({
    action: "conversion_logged",
    entityType: "lead",
    entityId: data.leadId,
    userId: "system",
    metadata: { conversionId: convRef.id, value: data.value },
    timestamp: now,
  });

  functions.logger.info("kafka:conversion-events", { leadId: data.leadId, value: data.value });

  return { success: true, conversionId: convRef.id };
});
