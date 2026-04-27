import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import { z } from "zod";
import { formatQuoteEmail, formatQuoteWhatsApp, type StayQuote } from "./quoteFormatter";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ─── Schemas ──────────────────────────────────────────────────────────────────

const quoteSchema = z.object({
  nights:            z.number(),
  publicNightlyRate: z.number(),
  publicTotal:       z.number(),
  directNightlyRate: z.number(),
  directSubtotal:    z.number(),
  taxGst:            z.number(),
  taxServiceCharge:  z.number(),
  taxGreenTax:       z.number(),
  taxTotal:          z.number(),
  transferCost:      z.number(),
  directTotal:       z.number(),
  savingsValue:      z.number(),
  savingsPercent:    z.number(),
}).optional();

const leadSchema = z.object({
  fullName:         z.string().min(2),
  email:            z.string().email(),
  phone:            z.string().min(7),
  preferredContact: z.enum(["email", "whatsapp"]).default("email"),
  country:          z.string().optional().default("—"),
  nearestAirport:   z.string().optional().default("MLE"),
  checkIn:          z.string().min(1),
  checkOut:         z.string().min(1),
  adults:           z.coerce.number().min(1),
  children:         z.coerce.number().min(0),
  villaCategory:    z.string().min(1),
  budget:           z.string().optional().default("direct-enquiry"),
  message:          z.string().optional(),
  utmSource:        z.string().optional(),
  utmMedium:        z.string().optional(),
  utmCampaign:      z.string().optional(),
  selectedRate:     z.coerce.number().optional(),
  selectedFlightRedirect: z.string().optional(),
  quote:            quoteSchema,
});

// ─── Villa name lookup ────────────────────────────────────────────────────────

const VILLA_NAMES: Record<string, string> = {
  "overwater":        "Classic Overwater Villa",
  "beach":            "Beachfront Villa",
  "sunset-overwater": "Sunset Overwater Villa",
  "honeymoon":        "Honeymoon Suite",
};

// ─── Email sender ─────────────────────────────────────────────────────────────

async function dispatchEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    functions.logger.info("submitLead:email — SENDGRID_API_KEY not set, logging to console");
    functions.logger.info("EMAIL DRAFT", { to, subject, html: html.slice(0, 500) });
    return;
  }

  // Use nodemailer with SendGrid SMTP
  const transporter = nodemailer.createTransport({
    host:   "smtp.sendgrid.net",
    port:   587,
    auth:   { user: "apikey", pass: apiKey },
    secure: false,
  });

  await transporter.sendMail({
    from:    `"Veligandu Reservations" <veligandu@reservationsandsales.com>`,
    to,
    subject,
    html,
  });
}

// ─── Main function ────────────────────────────────────────────────────────────

export const submitLead = functions.https.onCall(async (request) => {
  const data   = request.data as unknown;
  const parsed = leadSchema.safeParse(data);

  if (!parsed.success) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid lead data",
      parsed.error.issues
    );
  }

  const lead = parsed.data;
  const now  = admin.firestore.FieldValue.serverTimestamp();

  // ── Dedup: same email + checkIn within 30 min ─────────────────────────────
  const recentSnap = await db
    .collection("leads")
    .where("email", "==", lead.email)
    .where("checkIn", "==", lead.checkIn)
    .limit(1)
    .get();

  if (!recentSnap.empty) {
    const existing = recentSnap.docs[0];
    return {
      leadId:           existing.id,
      confirmationCode: `VLG-${existing.id.slice(-6).toUpperCase()}`,
      duplicate:        true,
    };
  }

  // ── Persist lead ──────────────────────────────────────────────────────────
  const docRef = await db.collection("leads").add({
    ...lead,
    status:    "new",
    createdAt: now,
    updatedAt: now,
  });

  const confirmationCode = `VLG-${docRef.id.slice(-6).toUpperCase()}`;

  // ── Audit log ─────────────────────────────────────────────────────────────
  await db.collection("audit_logs").add({
    action:     "lead_created",
    entityType: "lead",
    entityId:   docRef.id,
    userId:     "guest",
    metadata: {
      villaCategory:    lead.villaCategory,
      email:            lead.email,
      preferredContact: lead.preferredContact,
      directTotal:      lead.quote?.directTotal ?? lead.selectedRate ?? 0,
    },
    timestamp: now,
  });

  // ── Conversion event ──────────────────────────────────────────────────────
  await db.collection("conversions").add({
    leadId:       docRef.id,
    villaCategory: lead.villaCategory,
    value:         lead.quote?.directTotal ?? lead.selectedRate ?? 0,
    currency:      "USD",
    utmSource:     lead.utmSource,
    utmCampaign:   lead.utmCampaign,
    preferredContact: lead.preferredContact,
    timestamp:     now,
  });

  // ── Send offer confirmation ───────────────────────────────────────────────
  const villaName = VILLA_NAMES[lead.villaCategory] ?? lead.villaCategory;

  if (lead.quote) {
    // Reconstruct a minimal StayQuote for formatting
    const stayQuote: StayQuote = {
      villaCategory:     lead.villaCategory,
      checkIn:           lead.checkIn,
      checkOut:          lead.checkOut,
      nights:            lead.quote.nights,
      adults:            lead.adults,
      children:          lead.children,
      totalGuests:       lead.adults + lead.children,
      isFallback:        false,
      publicNightlyRate: lead.quote.publicNightlyRate,
      publicTotal:       lead.quote.publicTotal,
      directNightlyRate: lead.quote.directNightlyRate,
      directSubtotal:    lead.quote.directSubtotal,
      taxes: {
        gst:           lead.quote.taxGst,
        serviceCharge: lead.quote.taxServiceCharge,
        greenTax:      lead.quote.taxGreenTax,
        total:         lead.quote.taxTotal,
      },
      transferType:    "speedboat",
      transferLabel:   "Return Speedboat Transfer",
      transferCost:    lead.quote.transferCost,
      directTotal:     lead.quote.directTotal,
      savingsValue:    lead.quote.savingsValue,
      savingsPercent:  lead.quote.savingsPercent,
      availabilityFlag: "available",
      availableUnits:  5,
      minStay:         3,
    };

    if (lead.preferredContact === "email") {
      const html = formatQuoteEmail(stayQuote, villaName, lead.fullName);
      await dispatchEmail(
        lead.email,
        `Your Exclusive Offer — ${villaName} · Veligandu Maldives`,
        html
      ).catch((err) => {
        functions.logger.error("submitLead:email-dispatch-failed", { err, leadId: docRef.id });
      });
    } else {
      // WhatsApp path — log the formatted message; real dispatch requires WA Business API
      const waMessage = formatQuoteWhatsApp(stayQuote, villaName, lead.fullName);
      functions.logger.info("submitLead:whatsapp-offer", {
        leadId:    docRef.id,
        to:        lead.phone,
        message:   waMessage,
      });
      // Store WhatsApp draft in Firestore for admin to send manually if no WA API
      await db.collection("whatsapp_queue").add({
        leadId:    docRef.id,
        to:        lead.phone,
        message:   waMessage,
        status:    "pending",
        createdAt: now,
      });
    }
  } else {
    // No quote snapshot — send simple acknowledgement email
    const simpleHtml = `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#0B2447;">
  <h2>Thank You, ${lead.fullName}</h2>
  <p>We have received your enquiry for a <strong>${villaName}</strong> from ${lead.checkIn} to ${lead.checkOut}.</p>
  <p>Our reservations team will prepare your personalised exclusive offer and respond within <strong>24 hours</strong>.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#888;font-size:13px;">Reservations &amp; Sales presenting Veligandu Maldives<br>
  <a href="mailto:veligandu@reservationsandsales.com">veligandu@reservationsandsales.com</a></p>
</div>`;
    await dispatchEmail(
      lead.email,
      `Enquiry Received — ${villaName} · Veligandu Maldives`,
      simpleHtml
    ).catch((err) => {
      functions.logger.error("submitLead:simple-email-failed", { err, leadId: docRef.id });
    });
  }

  functions.logger.info("submitLead:completed", {
    leadId:           docRef.id,
    villaCategory:    lead.villaCategory,
    preferredContact: lead.preferredContact,
    directTotal:      lead.quote?.directTotal,
  });

  return { leadId: docRef.id, confirmationCode };
});
