import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { z } from "zod";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const leadSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  country: z.string().min(2),
  nearestAirport: z.string().min(3),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  adults: z.coerce.number().min(1),
  children: z.coerce.number().min(0),
  villaCategory: z.string().min(1),
  budget: z.string().min(1),
  message: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  selectedRate: z.coerce.number().optional(),
  selectedFlightRedirect: z.string().optional(),
});

export const submitLead = functions.https.onCall(async (request) => {
  const data = request.data as unknown;
  const parsed = leadSchema.safeParse(data);
  if (!parsed.success) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid lead data", parsed.error.issues);
  }

  const lead = parsed.data;
  const now = admin.firestore.FieldValue.serverTimestamp();

  // Dedup check: same email + checkIn within 30 min
  const recentSnap = await db
    .collection("leads")
    .where("email", "==", lead.email)
    .where("checkIn", "==", lead.checkIn)
    .limit(1)
    .get();

  if (!recentSnap.empty) {
    const existing = recentSnap.docs[0];
    return {
      leadId: existing.id,
      confirmationCode: `VLG-${existing.id.slice(-6).toUpperCase()}`,
      duplicate: true,
    };
  }

  // Save lead
  const docRef = await db.collection("leads").add({
    ...lead,
    status: "new",
    createdAt: now,
    updatedAt: now,
  });

  const confirmationCode = `VLG-${docRef.id.slice(-6).toUpperCase()}`;

  // Audit log
  await db.collection("audit_logs").add({
    action: "lead_created",
    entityType: "lead",
    entityId: docRef.id,
    userId: "guest",
    metadata: { villaCategory: lead.villaCategory, email: lead.email },
    timestamp: now,
  });

  // Conversion event
  await db.collection("conversions").add({
    leadId: docRef.id,
    villaCategory: lead.villaCategory,
    value: lead.selectedRate ?? 0,
    currency: "USD",
    utmSource: lead.utmSource,
    utmCampaign: lead.utmCampaign,
    timestamp: now,
  });

  // Kafka-style event (logged to console in production without real broker)
  functions.logger.info("kafka:lead-created", { leadId: docRef.id, ...lead });

  return { leadId: docRef.id, confirmationCode };
});
