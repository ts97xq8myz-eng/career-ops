import * as functions from "firebase-functions";
import * as nodemailer from "nodemailer";

interface EmailInput {
  to: string;
  guestName: string;
  confirmationCode: string;
  villaCategory: string;
  checkIn: string;
  checkOut: string;
}

function createTransport() {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (sendgridKey) {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: { user: "apikey", pass: sendgridKey },
    });
  }
  // Mock transport — logs email to console
  return nodemailer.createTransport({ jsonTransport: true });
}

export const sendConfirmationEmail = functions.https.onCall(async (request) => {
  const { to, guestName, confirmationCode, villaCategory, checkIn, checkOut } =
    request.data as EmailInput;

  const transport = createTransport();

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#0B2447">
      <div style="background:#0B2447;padding:32px;text-align:center">
        <h1 style="color:white;font-size:28px;margin:0">VELIGANDU</h1>
        <p style="color:#C9A96E;font-size:12px;letter-spacing:3px;margin:4px 0 0">MALDIVES</p>
      </div>
      <div style="padding:32px;background:#FAF8F4">
        <p style="font-size:18px">Dear ${guestName},</p>
        <p>Thank you for your enquiry. Our reservations team will confirm availability and send you a personalised offer within <strong>24 hours</strong>.</p>
        <div style="background:#0B2447;border-radius:12px;padding:24px;margin:24px 0;text-align:center">
          <p style="color:#C9A96E;font-size:12px;letter-spacing:2px;margin:0 0 8px">CONFIRMATION CODE</p>
          <p style="color:white;font-size:24px;font-weight:bold;margin:0;font-family:monospace">${confirmationCode}</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;border-bottom:1px solid #EDE8DF;color:#666">Villa Type</td><td style="padding:8px 0;border-bottom:1px solid #EDE8DF;font-weight:bold;text-align:right">${villaCategory}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #EDE8DF;color:#666">Check-in</td><td style="padding:8px 0;border-bottom:1px solid #EDE8DF;font-weight:bold;text-align:right">${checkIn}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Check-out</td><td style="padding:8px 0;font-weight:bold;text-align:right">${checkOut}</td></tr>
        </table>
        <p style="margin-top:24px">If you have any questions, contact us on WhatsApp or reply to this email.</p>
        <p>Warm regards,<br><strong>Veligandu Reservations Team</strong></p>
      </div>
    </div>
  `;

  const result = await transport.sendMail({
    from: `"Veligandu Reservations" <${process.env.RESORT_EMAIL ?? "reservations@veligandu.com"}>`,
    to,
    subject: `Enquiry Confirmed — ${confirmationCode} | Veligandu Maldives`,
    html,
  });

  functions.logger.info("email:sent", { to, confirmationCode, result });

  return { success: true, messageId: typeof result === "object" && result !== null && "messageId" in result ? (result as { messageId: string }).messageId : "mock" };
});
