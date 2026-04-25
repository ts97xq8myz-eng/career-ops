import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions governing direct bookings at Veligandu Island Resort, managed by Reservations & Sales.",
};

const EFFECTIVE_DATE = "1 January 2025";
const COMPANY        = "Reservations & Sales";
const RESORT         = "Veligandu Island Resort";
const EMAIL          = "veligandu@reservationsandsales.com";

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 bg-[var(--color-sand-cool)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-[var(--color-gold-dark)] text-xs font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[var(--color-ocean)] mb-3">
            Terms &amp; Conditions
          </h1>
          <p className="text-[var(--color-ocean-muted)] text-sm">
            Effective date: {EFFECTIVE_DATE} · Managed by {COMPANY}
          </p>
        </div>

        <div className="prose prose-slate max-w-none bg-white rounded-2xl p-8 md:p-12 shadow-sm space-y-8 text-[var(--color-ocean)] leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">1. Introduction</h2>
            <p className="text-sm text-gray-700">
              These Terms &amp; Conditions (&quot;Terms&quot;) govern the relationship between you
              (&quot;Guest&quot;) and {COMPANY} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), acting as the authorised
              reservations agent for {RESORT} (&quot;the Resort&quot;), located at Veligandu Island,
              Rasdhoo Atoll, Republic of Maldives. By submitting a booking enquiry,
              confirming a reservation, or making any payment, you agree to be bound by
              these Terms in full.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">2. Reservations &amp; Confirmation</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>All bookings are subject to availability and are not confirmed until you receive a written confirmation from {COMPANY}.</li>
              <li>A reservation request submitted via our website or WhatsApp is an enquiry only and does not constitute a binding booking until we issue a formal Booking Confirmation.</li>
              <li>Confirmation is sent to the email address provided at the time of booking. It is your responsibility to ensure the address is correct.</li>
              <li>We reserve the right to decline any reservation at our discretion without providing a reason.</li>
              <li>Room category upgrades are subject to availability and additional charges may apply.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">3. Rates &amp; Best Rate Guarantee</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>All rates quoted are in US Dollars (USD) and are per villa per night, unless otherwise stated.</li>
              <li>Rates are exclusive of the Maldives Goods &amp; Services Tax (GST) of 16% and the Tourism Land Rental Tax where applicable, unless shown as &quot;inclusive&quot;.</li>
              <li>Our Best Rate Guarantee applies to publicly available rates on third-party Online Travel Agencies (OTAs) at the time of comparison. To claim the guarantee, contact us within 24 hours of booking with a link to the lower public rate.</li>
              <li>Seasonal surcharges may apply over peak periods including Christmas (20 Dec–5 Jan), Easter, and Eid. These will be disclosed at the time of quotation.</li>
              <li>Rates are subject to change without notice until a Booking Confirmation is issued.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">4. Payment Terms</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li><strong>Deposit:</strong> A non-refundable deposit of 30% of the total accommodation cost is required within 7 days of receiving your Booking Confirmation to secure your dates.</li>
              <li><strong>Balance:</strong> The remaining balance is due 45 days prior to arrival. For bookings made within 45 days of arrival, full payment is due immediately upon confirmation.</li>
              <li><strong>Payment methods:</strong> Bank transfer (SWIFT), credit card (Visa, Mastercard, Amex — a 3.5% processing fee applies), or other methods as advised.</li>
              <li>All payments must be made in USD. Currency conversion losses are borne by the guest.</li>
              <li>Failure to settle the balance by the due date may result in automatic cancellation of the booking and forfeiture of the deposit.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">5. Cancellation &amp; Modification</h2>
            <p className="text-sm text-gray-700 mb-2">
              Please refer to our <Link href="/cancellation" className="text-[var(--color-gold-dark)] underline">Cancellation Policy</Link> for full details.
              In summary:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>Cancellations 60+ days prior to arrival: deposit forfeited; balance refunded in full.</li>
              <li>Cancellations 30–59 days prior: 50% of total booking value charged.</li>
              <li>Cancellations within 30 days: 100% of total booking value charged (no refund).</li>
              <li>Modifications are subject to availability and rate differences may apply.</li>
              <li>We strongly recommend comprehensive travel insurance including trip cancellation cover.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">6. Check-in &amp; Check-out</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>Standard check-in: 14:00 local Maldives time (UTC+5). Standard check-out: 12:00 noon.</li>
              <li>Early check-in and late check-out are subject to availability and may incur additional charges.</li>
              <li>The Resort reserves the right to deny check-in if payment has not been received in full or if the Guest does not comply with resort policies.</li>
              <li>Guests must present a valid passport and a copy of their Booking Confirmation at check-in.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">7. Transfers &amp; Travel</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>Veligandu Island is accessible by seaplane (approximately 35 minutes from Velana International Airport, Malé) or speedboat (approximately 2.5 hours). Transfer type depends on arrival time and availability.</li>
              <li>Seaplane transfers operate during daylight hours only. Late arrivals will be accommodated by speedboat.</li>
              <li>Transfer costs are not included in accommodation rates unless specified as a package inclusion.</li>
              <li>{COMPANY} and the Resort accept no liability for delays caused by weather, airline schedules, or other factors outside our control.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">8. Resort Policies</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>The Maldives is an Islamic country. Public nudity, the display of intimate affection in non-designated areas, and the consumption of alcohol outside licensed resort premises are prohibited by Maldivian law.</li>
              <li>Guests are required to observe the Resort's dress code in public areas. Swimwear is not appropriate in restaurants and reception areas.</li>
              <li>The Resort operates a strict no-drone policy without prior written approval from management.</li>
              <li>Pets are not permitted.</li>
              <li>Guests causing wilful damage to Resort property will be charged the full replacement cost.</li>
              <li>The Resort reserves the right to request the departure of any Guest whose conduct is deemed disruptive or offensive, without refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">9. Liability</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>{COMPANY} acts solely as a reservations agent for {RESORT}. We accept no liability for acts or omissions of the Resort, its staff, or suppliers.</li>
              <li>Neither {COMPANY} nor the Resort shall be liable for loss, theft, or damage to personal property on the island or during transfers.</li>
              <li>Participation in water sports, diving, excursions, and spa treatments is at the Guest&apos;s own risk. The Resort carries its own insurance; Guests are advised to maintain their own.</li>
              <li>To the maximum extent permitted by law, our total aggregate liability to you for any claim shall not exceed the total amount paid by you to us for the specific booking.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">10. Force Majeure</h2>
            <p className="text-sm text-gray-700">
              Neither {COMPANY} nor the Resort shall be in breach of these Terms or liable for any failure or delay in performance arising from causes beyond our reasonable control, including but not limited to natural disasters, acts of God, pandemics, government actions, civil unrest, or airline failure. In such circumstances, we will make every effort to offer alternative dates or credit where possible.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">11. Privacy</h2>
            <p className="text-sm text-gray-700">
              Personal data collected during the booking process is handled in accordance with our{" "}
              <Link href="/privacy" className="text-[var(--color-gold-dark)] underline">Privacy Policy</Link>.
              By booking, you consent to the processing of your data as described therein.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">12. Governing Law &amp; Disputes</h2>
            <p className="text-sm text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of the Republic of Maldives. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Maldives, without prejudice to any right to seek injunctive relief in any other jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">13. Contact</h2>
            <p className="text-sm text-gray-700">
              For queries regarding these Terms, please contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[var(--color-gold-dark)] underline">{EMAIL}</a>{" "}
              or via WhatsApp at +960 777 9519. Our team is available 7 days a week, 08:00–22:00 Maldives time.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">14. Amendments</h2>
            <p className="text-sm text-gray-700">
              {COMPANY} reserves the right to amend these Terms at any time. The version in effect at the time your Booking Confirmation is issued shall govern your booking.
            </p>
          </section>
        </div>

        {/* Links */}
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy"      className="text-[var(--color-gold-dark)] hover:underline">Privacy Policy</Link>
          <Link href="/cancellation" className="text-[var(--color-gold-dark)] hover:underline">Cancellation Policy</Link>
          <Link href="/book"         className="text-[var(--color-gold-dark)] hover:underline">Book Your Stay</Link>
        </div>
      </div>
    </div>
  );
}
