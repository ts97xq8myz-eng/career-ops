/**
 * Deterministic pricing engine — pure functions, no side effects.
 *
 * RULE: publicRate is ALWAYS shown excluding taxes & transfers.
 *       directRate is ALWAYS shown including taxes & transfers.
 *       These two are never mixed in display.
 */

// ─── Maldives Tax Structure ───────────────────────────────────────────────────
export const MALDIVES_TAXES = {
  GST:                          0.16, // 16% GST on accommodation
  SERVICE_CHARGE:               0.10, // 10% service charge
  GREEN_TAX_PER_PERSON_PER_NIGHT: 6,  // USD — all guests incl. children
} as const;

// ─── Transfer Costs (included in direct rate) ─────────────────────────────────
export const TRANSFERS = {
  speedboat: { label: "Return Speedboat Transfer", perPersonRoundTrip: 90  },
  seaplane:  { label: "Seaplane (upgrade)",        perPersonRoundTrip: 450 },
} as const;

export const DIRECT_DISCOUNT_PERCENT = 9; // always 9% below public OTA rate

// ─── Baseline fallback rates (used when Kafka/Firestore unavailable) ──────────
// These are the OTA reference (public) rates before tax — admin sets real values
export const BASELINE_PUBLIC_RATES: Record<string, number> = {
  "overwater":        920,
  "beach":            710,
  "sunset-overwater": 1200,
  "honeymoon":        1550,
};

export const BASELINE_AVAILABILITY: Record<string, number> = {
  "overwater":        8,
  "beach":            6,
  "sunset-overwater": 4,
  "honeymoon":        2,
};

export const BASELINE_MIN_STAY: Record<string, number> = {
  "overwater":        3,
  "beach":            3,
  "sunset-overwater": 4,
  "honeymoon":        5,
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type AvailabilityFlag = "available" | "limited" | "on-request";

export interface StayQuote {
  villaCategory:  string;
  checkIn:        string;
  checkOut:       string;
  nights:         number;
  adults:         number;
  children:       number;
  totalGuests:    number;
  isFallback:     boolean; // true when live rates unavailable

  // ── Public (OTA reference) — EXCLUDING taxes & transfers ──────────────────
  publicNightlyRate: number;
  publicTotal:       number;  // nights × publicNightlyRate

  // ── Direct — INCLUDING taxes & transfers ─────────────────────────────────
  directNightlyRate: number;  // publicNightlyRate × (1 - 9%)
  directSubtotal:    number;  // nights × directNightlyRate (room only, pre-tax)
  taxes: {
    gst:           number;
    serviceCharge: number;
    greenTax:      number;
    total:         number;
  };
  transferCost:    number;    // speedboat RT × totalGuests
  directTotal:     number;    // directSubtotal + taxes.total + transferCost

  // ── Savings ───────────────────────────────────────────────────────────────
  savingsValue:   number;     // publicTotal − directSubtotal (room vs room)
  savingsPercent: number;     // always DIRECT_DISCOUNT_PERCENT (9)

  // ── Availability ──────────────────────────────────────────────────────────
  availabilityFlag: AvailabilityFlag;
  availableUnits:   number;
  minStay:          number;
}

// ─── Core helpers ─────────────────────────────────────────────────────────────

export function countNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

function deriveAvailabilityFlag(units: number): AvailabilityFlag {
  if (units <= 0) return "on-request";
  if (units <= 2) return "limited";
  return "available";
}

// ─── Main quote builder ───────────────────────────────────────────────────────

export function buildStayQuote(p: {
  villaCategory:     string;
  checkIn:           string;
  checkOut:          string;
  adults:            number;
  children:          number;
  publicNightlyRate: number;
  availableUnits:    number;
  minStay:           number;
  isFallback?:       boolean;
}): StayQuote {
  const nights      = countNights(p.checkIn, p.checkOut);
  const totalGuests = p.adults + p.children;

  // Public — excl. taxes & transfers
  const publicTotal = p.publicNightlyRate * nights;

  // Direct — 9% below public, then add Maldives taxes + speedboat transfer
  const directNightlyRate = p.publicNightlyRate * (1 - DIRECT_DISCOUNT_PERCENT / 100);
  const directSubtotal    = directNightlyRate * nights;

  const gst           = directSubtotal * MALDIVES_TAXES.GST;
  const serviceCharge = directSubtotal * MALDIVES_TAXES.SERVICE_CHARGE;
  const greenTax      = MALDIVES_TAXES.GREEN_TAX_PER_PERSON_PER_NIGHT * totalGuests * nights;
  const taxTotal      = gst + serviceCharge + greenTax;

  const transferCost = TRANSFERS.speedboat.perPersonRoundTrip * totalGuests;
  const directTotal  = directSubtotal + taxTotal + transferCost;

  return {
    villaCategory:     p.villaCategory,
    checkIn:           p.checkIn,
    checkOut:          p.checkOut,
    nights,
    adults:            p.adults,
    children:          p.children,
    totalGuests,
    isFallback:        p.isFallback ?? false,

    publicNightlyRate: p.publicNightlyRate,
    publicTotal,

    directNightlyRate,
    directSubtotal,
    taxes:             { gst, serviceCharge, greenTax, total: taxTotal },
    transferCost,
    directTotal,

    savingsValue:      publicTotal - directSubtotal,
    savingsPercent:    DIRECT_DISCOUNT_PERCENT,

    availabilityFlag:  deriveAvailabilityFlag(p.availableUnits),
    availableUnits:    p.availableUnits,
    minStay:           p.minStay,
  };
}

/** Build a quote using baseline fallback data (no live rates available) */
export function buildFallbackQuote(p: {
  villaCategory: string;
  checkIn:       string;
  checkOut:      string;
  adults:        number;
  children:      number;
}): StayQuote {
  return buildStayQuote({
    ...p,
    publicNightlyRate: BASELINE_PUBLIC_RATES[p.villaCategory] ?? 920,
    availableUnits:    BASELINE_AVAILABILITY[p.villaCategory] ?? 5,
    minStay:           BASELINE_MIN_STAY[p.villaCategory] ?? 3,
    isFallback:        true,
  });
}

// ─── WhatsApp message formatter ───────────────────────────────────────────────

export function formatQuoteWhatsApp(
  q: StayQuote,
  villaName: string,
  guestName: string,
): string {
  const f = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  return [
    `*Veligandu Maldives — Exclusive Direct Offer*`,
    ``,
    `Hello ${guestName} 👋`,
    ``,
    `Your personalised rate offer is ready:`,
    ``,
    `🏝 *${villaName}*`,
    `📅 ${q.checkIn} → ${q.checkOut} (${q.nights} night${q.nights !== 1 ? "s" : ""})`,
    `👥 ${q.adults} adult${q.adults !== 1 ? "s" : ""}${q.children ? ` + ${q.children} child${q.children !== 1 ? "ren" : ""}` : ""}`,
    ``,
    `*── Rate Comparison ──*`,
    ``,
    `❌ OTA / Booking.com rate:`,
    `   ${f(q.publicNightlyRate)}/night × ${q.nights} = ${f(q.publicTotal)}`,
    `   _(excludes taxes & transfers)_`,
    ``,
    `✅ *Your Direct Exclusive Rate:*`,
    `   Room: ${f(q.directNightlyRate)}/night × ${q.nights} = ${f(q.directSubtotal)}`,
    `   + GST 16%: ${f(q.taxes.gst)}`,
    `   + Service charge 10%: ${f(q.taxes.serviceCharge)}`,
    `   + Green Tax ($6/person/night): ${f(q.taxes.greenTax)}`,
    `   + Return speedboat transfer: ${f(q.transferCost)}`,
    `   ─────────────────────────────`,
    `   *All-inclusive total: ${f(q.directTotal)}*`,
    ``,
    `💰 *You save ${f(q.savingsValue)} (${q.savingsPercent}%) vs OTA room rate*`,
    ``,
    `⏰ Valid 24 hours. Reply *YES* to confirm.`,
    ``,
    `📧 veligandu@reservationsandsales.com`,
    `📞 +960 666 0519`,
    `_Reservations & Sales | Veligandu Maldives_`,
  ].join("\n");
}

// ─── Email HTML formatter ─────────────────────────────────────────────────────

export function formatQuoteEmail(
  q: StayQuote,
  villaName: string,
  guestName: string,
): string {
  const f = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
  const guests = `${q.adults} adult${q.adults !== 1 ? "s" : ""}${q.children ? ` + ${q.children} child${q.children !== 1 ? "ren" : ""}` : ""}`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Exclusive Offer — Veligandu Maldives</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
<div style="max-width:620px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);">

  <!-- Header -->
  <div style="background:#0B2447;padding:36px 48px;text-align:center;">
    <p style="color:#C9A96E;font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:0 0 6px;font-family:Arial,sans-serif;">Reservations &amp; Sales presenting</p>
    <h1 style="color:#ffffff;font-size:30px;margin:0;letter-spacing:4px;font-family:Georgia,serif;">VELIGANDU</h1>
    <p style="color:#C9A96E;font-size:10px;letter-spacing:6px;margin:4px 0 0;font-family:Arial,sans-serif;">MALDIVES</p>
  </div>

  <!-- Body -->
  <div style="padding:40px 48px;">
    <p style="color:#0B2447;font-size:16px;margin:0 0 8px;">Dear ${guestName},</p>
    <p style="color:#555;line-height:1.75;margin:0 0 28px;">Thank you for your direct enquiry. Your personalised exclusive offer — <strong>including all taxes and transfers</strong> — is set out below. This rate is available only through our reservations team and is not available on any public booking platform.</p>

    <!-- Stay summary -->
    <table style="width:100%;border-collapse:collapse;margin:0 0 32px;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0;">
      <tr style="background:#f5f0e8;">
        <td colspan="2" style="padding:14px 18px;font-weight:bold;color:#0B2447;font-size:17px;">🏝 ${villaName}</td>
      </tr>
      <tr><td style="padding:10px 18px;color:#888;font-size:14px;border-bottom:1px solid #f0ece4;">Check-in</td><td style="padding:10px 18px;font-weight:bold;color:#0B2447;border-bottom:1px solid #f0ece4;">${q.checkIn}</td></tr>
      <tr><td style="padding:10px 18px;color:#888;font-size:14px;border-bottom:1px solid #f0ece4;">Check-out</td><td style="padding:10px 18px;font-weight:bold;color:#0B2447;border-bottom:1px solid #f0ece4;">${q.checkOut}</td></tr>
      <tr><td style="padding:10px 18px;color:#888;font-size:14px;border-bottom:1px solid #f0ece4;">Duration</td><td style="padding:10px 18px;font-weight:bold;color:#0B2447;border-bottom:1px solid #f0ece4;">${q.nights} night${q.nights !== 1 ? "s" : ""}</td></tr>
      <tr><td style="padding:10px 18px;color:#888;font-size:14px;">Guests</td><td style="padding:10px 18px;font-weight:bold;color:#0B2447;">${guests}</td></tr>
    </table>

    <!-- Rate comparison -->
    <h3 style="color:#0B2447;border-bottom:2px solid #C9A96E;padding-bottom:10px;margin:0 0 16px;font-size:18px;">Rate Comparison</h3>

    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
      <!-- Public rate row -->
      <tr style="background:#fafafa;">
        <td colspan="2" style="padding:12px 16px;color:#888;font-size:13px;border:1px solid #eee;line-height:1.5;">
          <strong style="color:#555;">OTA / Booking.com Reference Rate</strong><br>
          <span style="font-size:11px;">Excludes taxes &amp; transfers</span>
        </td>
        <td style="padding:12px 16px;text-align:right;border:1px solid #eee;color:#888;white-space:nowrap;">
          ${f(q.publicNightlyRate)}/night<br>
          <strong>${f(q.publicTotal)} total</strong>
        </td>
      </tr>

      <!-- Direct rate header -->
      <tr style="background:#0B2447;">
        <td colspan="2" style="padding:14px 16px;font-weight:bold;font-size:15px;color:#C9A96E;">✦ Direct Exclusive Rate — Room</td>
        <td style="padding:14px 16px;text-align:right;font-weight:bold;color:#fff;white-space:nowrap;">
          ${f(q.directNightlyRate)}/night<br>${f(q.directSubtotal)}
        </td>
      </tr>
      <!-- Tax lines -->
      <tr><td colspan="2" style="padding:9px 16px;color:#666;border:1px solid #eee;font-size:13px;">+ GST (16%)</td><td style="padding:9px 16px;text-align:right;border:1px solid #eee;color:#666;font-size:13px;">+${f(q.taxes.gst)}</td></tr>
      <tr style="background:#fafafa;"><td colspan="2" style="padding:9px 16px;color:#666;border:1px solid #eee;font-size:13px;">+ Service Charge (10%)</td><td style="padding:9px 16px;text-align:right;border:1px solid #eee;color:#666;font-size:13px;">+${f(q.taxes.serviceCharge)}</td></tr>
      <tr><td colspan="2" style="padding:9px 16px;color:#666;border:1px solid #eee;font-size:13px;">+ Green Tax ($6/person/night)</td><td style="padding:9px 16px;text-align:right;border:1px solid #eee;color:#666;font-size:13px;">+${f(q.taxes.greenTax)}</td></tr>
      <tr style="background:#fafafa;"><td colspan="2" style="padding:9px 16px;color:#666;border:1px solid #eee;font-size:13px;">+ Return Speedboat Transfer</td><td style="padding:9px 16px;text-align:right;border:1px solid #eee;color:#666;font-size:13px;">+${f(q.transferCost)}</td></tr>

      <!-- Total -->
      <tr style="background:#C9A96E;">
        <td colspan="2" style="padding:16px;font-weight:bold;font-size:19px;color:#0B2447;">ALL-INCLUSIVE TOTAL</td>
        <td style="padding:16px;text-align:right;font-weight:bold;font-size:23px;color:#0B2447;white-space:nowrap;">${f(q.directTotal)}</td>
      </tr>
    </table>

    <!-- Savings callout -->
    <div style="background:#f0fff4;border-left:4px solid #22c55e;padding:16px 20px;margin:0 0 28px;border-radius:4px;">
      <strong style="color:#166534;font-size:15px;">You save ${f(q.savingsValue)} (${q.savingsPercent}%) vs the OTA room rate</strong><br>
      <span style="color:#166534;font-size:13px;">OTA total does not include taxes or transfers. Our direct rate does — completely.</span>
    </div>

    <p style="color:#555;line-height:1.75;margin:0 0 8px;">To confirm your reservation, reply to this email or WhatsApp us at <strong>+960 777 9519</strong>.</p>
    <p style="color:#555;line-height:1.75;margin:0 0 28px;">Your dates will be held for <strong>24 hours</strong> pending confirmation.</p>

    <div style="text-align:center;margin:0 0 8px;">
      <a href="https://wa.me/9607779519" style="display:inline-block;background:#25D366;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">Reply via WhatsApp</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#0B2447;padding:24px 48px;text-align:center;">
    <p style="color:#C9A96E;font-size:10px;margin:0 0 4px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Reservations &amp; Sales</p>
    <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:0 0 2px;">Veligandu Island, Rasdhoo Atoll, Republic of Maldives</p>
    <p style="font-size:12px;margin:4px 0 0;">
      <a href="mailto:veligandu@reservationsandsales.com" style="color:#C9A96E;text-decoration:none;">veligandu@reservationsandsales.com</a>
      &nbsp;|&nbsp;
      <span style="color:rgba(255,255,255,0.55);">+960 666 0519</span>
    </p>
  </div>
</div>
</body>
</html>`;
}
