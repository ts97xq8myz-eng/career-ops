import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { publishEvent, makeEvent } from "@/lib/kafka/producer";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as unknown;
    const data = leadSchema.parse(body);

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const lead = {
      id: leadId,
      ...data,
      status: "new",
      confirmationCode: `VLG-${leadId.slice(-6).toUpperCase()}`,
      createdAt: now,
      updatedAt: now,
    };

    // In production: save to Firestore via admin SDK or Firebase Function
    // For now: publish Kafka event (which logs in mock mode) and return success
    await publishEvent(
      makeEvent("lead-created", leadId, lead, "web")
    );

    // Also log conversion event
    await publishEvent(
      makeEvent("conversion-events", leadId, {
        leadId,
        villaCategory: data.villaCategory,
        value: data.selectedRate,
        currency: "USD",
        utmSource: data.utmSource,
        timestamp: now,
      }, "web")
    );

    return NextResponse.json(
      { success: true, leadId, confirmationCode: lead.confirmationCode },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    console.error("[POST /api/leads]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
