/**
 * Quote formatting utilities — self-contained copy for Firebase Functions.
 * Keep in sync with lib/rates/calculator.ts (formatting section only).
 */

export interface StayQuote {
  villaCategory:     string;
  checkIn:           string;
  checkOut:          string;
  nights:            number;
  adults:            number;
  children:          number;
  totalGuests:       number;
  isFallback:        boolean;
  publicNightlyRate: number;
  publicTotal:       number;
  directNightlyRate: number;
  directSubtotal:    number;
  taxes: {
    gst:           number;
    serviceCharge: number;
    greenTax:      number;
    total:         number;
  };
  transferType:    "speedboat" | "seaplane";
  transferLabel:   string;
  transferCost:    number;
  directTotal:     number;
  savingsValue:    number;
  savingsPercent:  number;
  availabilityFlag: string;
  availableUnits:  number;
  minStay:         number;
}

function f(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatQuoteWhatsApp(q: StayQuote, villaName: string, guestName: string): string {
  const guests = `${q.adults} adult${q.adults !== 1 ? "s" : ""}${q.children ? ` + ${q.children} child${q.children !== 1 ? "ren" : ""}` : ""}`;
  return [
    `*Veligandu Maldives — Exclusive Direct Offer*`,
    ``,
    `Hello ${guestName} 👋`,
    ``,
    `Your personalised rate offer is ready:`,
    ``,
    `🏝 *${villaName}*`,
    `📅 ${q.checkIn} → ${q.checkOut} (${q.nights} night${q.nights !== 1 ? "s" : ""})`,
    `👥 ${guests}`,
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

export function formatQuoteEmail(q: StayQuote, villaName: string, guestName: string): string {
  const guests = `${q.adults} adult${q.adults !== 1 ? "s" : ""}${q.children ? ` + ${q.children} child${q.children !== 1 ? "ren" : ""}` : ""}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Exclusive Offer — Veligandu Maldives</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif;">
<div style="max-width:620px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);">
  <div style="background:#0B2447;padding:36px 48px;text-align:center;">
    <p style="color:#C9A96E;font-size:10px;letter-spacing:4px;text-transform:uppercase;margin:0 0 6px;font-family:Arial,sans-serif;">Reservations &amp; Sales presenting</p>
    <h1 style="color:#ffffff;font-size:30px;margin:0;letter-spacing:4px;">VELIGANDU</h1>
    <p style="color:#C9A96E;font-size:10px;letter-spacing:6px;margin:4px 0 0;font-family:Arial,sans-serif;">MALDIVES</p>
  </div>
  <div style="padding:40px 48px;">
    <p style="color:#0B2447;font-size:16px;margin:0 0 8px;">Dear ${guestName},</p>
    <p style="color:#555;line-height:1.75;margin:0 0 28px;">Thank you for your direct enquiry. Your personalised exclusive offer — <strong>including all taxes and transfers</strong> — is set out below.</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 32px;border:1px solid #e8e0d0;border-radius:8px;overflow:hidden;">
      <tr style="background:#f5f0e8;"><td colspan="2" style="padding:14px 18px;font-weight:bold;color:#0B2447;font-size:17px;">🏝 ${villaName}</td></tr>
      <tr><td style="padding:10px 18px;color:#888;font-size:14px;border-bottom:1px solid #f0ece4;">Check-in</td><td style="padding:10px 18px;font-weight:bold;color:#0B2447;border-bottom:1px solid #f0ece4;">${q.checkIn}</td></tr>
      <tr><td style="padding:10px 18px;color:#888;font-size:14px;border-bottom:1px solid #f0ece4;">Check-out</td><td style="padding:10px 18px;font-weight:bold;color:#0B2447;border-bottom:1px solid #f0ece4;">${q.checkOut}</td></tr>
      <tr><td style="padding:10px 18px;color:#888;font-size:14px;border-bottom:1px solid #f0ece4;">Duration</td><td style="padding:10px 18px;font-weight:bold;color:#0B2447;border-bottom:1px solid #f0ece4;">${q.nights} night${q.nights !== 1 ? "s" : ""}</td></tr>
      <tr><td style="padding:10px 18px;color:#888;font-size:14px;">Guests</td><td style="padding:10px 18px;font-weight:bold;color:#0B2447;">${guests}</td></tr>
    </table>
    <h3 style="color:#0B2447;border-bottom:2px solid #C9A96E;padding-bottom:10px;margin:0 0 16px;font-size:18px;">Rate Comparison</h3>
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
      <tr style="background:#fafafa;">
        <td colspan="2" style="padding:12px 16px;color:#888;font-size:13px;border:1px solid #eee;line-height:1.5;"><strong style="color:#555;">OTA / Booking.com Reference — excl. taxes &amp; transfers</strong></td>
        <td style="padding:12px 16px;text-align:right;border:1px solid #eee;color:#888;white-space:nowrap;">${f(q.publicNightlyRate)}/night<br><strong>${f(q.publicTotal)} total</strong></td>
      </tr>
      <tr style="background:#0B2447;color:white;">
        <td colspan="2" style="padding:14px 16px;font-weight:bold;font-size:15px;color:#C9A96E;">✦ Direct Exclusive Rate — room only</td>
        <td style="padding:14px 16px;text-align:right;font-weight:bold;color:#fff;white-space:nowrap;">${f(q.directNightlyRate)}/night<br>${f(q.directSubtotal)}</td>
      </tr>
      <tr><td colspan="2" style="padding:9px 16px;color:#666;border:1px solid #eee;font-size:13px;">+ GST (16%)</td><td style="padding:9px 16px;text-align:right;border:1px solid #eee;color:#666;font-size:13px;">+${f(q.taxes.gst)}</td></tr>
      <tr style="background:#fafafa;"><td colspan="2" style="padding:9px 16px;color:#666;border:1px solid #eee;font-size:13px;">+ Service Charge (10%)</td><td style="padding:9px 16px;text-align:right;border:1px solid #eee;color:#666;font-size:13px;">+${f(q.taxes.serviceCharge)}</td></tr>
      <tr><td colspan="2" style="padding:9px 16px;color:#666;border:1px solid #eee;font-size:13px;">+ Green Tax ($6/person/night)</td><td style="padding:9px 16px;text-align:right;border:1px solid #eee;color:#666;font-size:13px;">+${f(q.taxes.greenTax)}</td></tr>
      <tr style="background:#fafafa;"><td colspan="2" style="padding:9px 16px;color:#666;border:1px solid #eee;font-size:13px;">+ Return Speedboat Transfer</td><td style="padding:9px 16px;text-align:right;border:1px solid #eee;color:#666;font-size:13px;">+${f(q.transferCost)}</td></tr>
      <tr style="background:#C9A96E;">
        <td colspan="2" style="padding:16px;font-weight:bold;font-size:19px;color:#0B2447;">ALL-INCLUSIVE TOTAL</td>
        <td style="padding:16px;text-align:right;font-weight:bold;font-size:23px;color:#0B2447;white-space:nowrap;">${f(q.directTotal)}</td>
      </tr>
    </table>
    <div style="background:#f0fff4;border-left:4px solid #22c55e;padding:16px 20px;margin:0 0 28px;border-radius:4px;">
      <strong style="color:#166534;font-size:15px;">You save ${f(q.savingsValue)} (${q.savingsPercent}%) vs the OTA room rate</strong><br>
      <span style="color:#166534;font-size:13px;">OTA total does not include taxes or transfers. Our direct rate does — completely.</span>
    </div>
    <p style="color:#555;line-height:1.75;margin:0 0 28px;">Reply to this email or WhatsApp us at <strong>+960 777 9519</strong>. Your dates are held for <strong>24 hours</strong>.</p>
    <div style="text-align:center;">
      <a href="https://wa.me/9607779519" style="display:inline-block;background:#25D366;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">Reply via WhatsApp</a>
    </div>
  </div>
  <div style="background:#0B2447;padding:24px 48px;text-align:center;">
    <p style="color:#C9A96E;font-size:10px;margin:0 0 4px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Reservations &amp; Sales</p>
    <p style="color:rgba(255,255,255,0.55);font-size:12px;margin:0;">Veligandu Island, Rasdhoo Atoll, Republic of Maldives</p>
    <p style="font-size:12px;margin:4px 0 0;"><a href="mailto:veligandu@reservationsandsales.com" style="color:#C9A96E;text-decoration:none;">veligandu@reservationsandsales.com</a></p>
  </div>
</div>
</body></html>`;
}
