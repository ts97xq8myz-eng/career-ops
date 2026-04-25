import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Reservations & Sales collects, uses, and protects your personal data for Veligandu Island Resort bookings.",
};

const EFFECTIVE_DATE = "1 January 2025";
const COMPANY        = "Reservations & Sales";
const EMAIL          = "privacy@reservationsandsales.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 bg-[var(--color-sand-cool)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="text-[var(--color-gold-dark)] text-xs font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[var(--color-ocean)] mb-3">
            Privacy Policy
          </h1>
          <p className="text-[var(--color-ocean-muted)] text-sm">
            Effective date: {EFFECTIVE_DATE} · {COMPANY}
          </p>
        </div>

        <div className="prose prose-slate max-w-none bg-white rounded-2xl p-8 md:p-12 shadow-sm space-y-8 text-[var(--color-ocean)] leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">1. Who We Are</h2>
            <p className="text-sm text-gray-700">
              {COMPANY} (&quot;we&quot;, &quot;us&quot;) is the authorised reservations agent for Veligandu Island
              Resort, Maldives. We are committed to protecting your personal data and
              respecting your privacy in compliance with applicable data protection legislation.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">2. Data We Collect</h2>
            <p className="text-sm text-gray-700 mb-2">We collect the following categories of personal data:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li><strong>Identity data:</strong> full name, date of birth, nationality, passport number.</li>
              <li><strong>Contact data:</strong> email address, phone number, postal address.</li>
              <li><strong>Booking data:</strong> reservation details, villa preferences, travel dates, special requests.</li>
              <li><strong>Financial data:</strong> payment card details (processed by our PCI-compliant payment processor — we do not store full card numbers).</li>
              <li><strong>Usage data:</strong> IP address, browser type, pages visited, referral source, UTM parameters.</li>
              <li><strong>Communications data:</strong> emails, WhatsApp messages, and enquiry form submissions sent to us.</li>
              <li><strong>Dietary and health data:</strong> where voluntarily provided (e.g., dietary requirements, accessibility needs). This is treated as sensitive data.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>To process and confirm your reservation.</li>
              <li>To communicate with you about your booking, including confirmation, updates, and pre-arrival information.</li>
              <li>To facilitate transfers, excursions, and in-resort experiences you have requested.</li>
              <li>To comply with legal obligations (e.g., immigration and tax records).</li>
              <li>To send marketing communications — only where you have given explicit consent. You may opt out at any time.</li>
              <li>To improve our website and services using aggregated, anonymised analytics.</li>
              <li>To prevent fraud and ensure the security of our systems.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">4. Legal Basis for Processing</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li><strong>Contract:</strong> Processing necessary to fulfil your booking and provide the services you have requested.</li>
              <li><strong>Legal obligation:</strong> Compliance with tax, immigration, and financial regulations.</li>
              <li><strong>Legitimate interests:</strong> Fraud prevention, security, service improvement.</li>
              <li><strong>Consent:</strong> Direct marketing communications (you may withdraw consent at any time).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">5. Data Sharing</h2>
            <p className="text-sm text-gray-700 mb-2">We share your data only where necessary:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li><strong>Veligandu Island Resort:</strong> To fulfil your reservation and in-resort services.</li>
              <li><strong>Transfer operators:</strong> Seaplane and speedboat providers require guest name and flight details.</li>
              <li><strong>Payment processors:</strong> Stripe or equivalent — PCI DSS Level 1 compliant.</li>
              <li><strong>Firebase / Google Cloud:</strong> Our platform infrastructure. Data is stored within Firebase's secure cloud environment.</li>
              <li><strong>Legal authorities:</strong> Where required by Maldivian law or court order.</li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">We do not sell your personal data to any third party.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">6. Data Retention</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>Booking records are retained for 7 years to comply with financial and tax regulations.</li>
              <li>Marketing preferences are retained until you withdraw consent.</li>
              <li>Website usage data is retained for 26 months.</li>
              <li>Enquiries that did not result in a confirmed booking are retained for 12 months.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">7. Cookies &amp; Tracking</h2>
            <p className="text-sm text-gray-700 mb-2">Our website uses the following types of cookies:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li><strong>Essential cookies:</strong> Required for the booking form and website functionality. Cannot be disabled.</li>
              <li><strong>Analytics cookies:</strong> Google Analytics (anonymised) — help us understand how visitors use the site.</li>
              <li><strong>Advertising cookies:</strong> Google Ads and Meta Pixel — used to measure the performance of our marketing campaigns. These are only active if you have consented.</li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">
              You may manage your cookie preferences at any time via your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">8. Your Rights</h2>
            <p className="text-sm text-gray-700 mb-2">You have the right to:</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Rectify</strong> inaccurate or incomplete data.</li>
              <li><strong>Erase</strong> your data where there is no longer a lawful basis for processing.</li>
              <li><strong>Restrict</strong> processing in certain circumstances.</li>
              <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format.</li>
              <li><strong>Object</strong> to processing based on legitimate interests or for direct marketing.</li>
              <li><strong>Withdraw consent</strong> at any time, without affecting the lawfulness of processing prior to withdrawal.</li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">
              To exercise any of these rights, contact us at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[var(--color-gold-dark)] underline">{EMAIL}</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">9. Security</h2>
            <p className="text-sm text-gray-700">
              We implement appropriate technical and organisational measures to protect your
              personal data against unauthorised access, alteration, disclosure, or destruction.
              These include TLS encryption, Firebase security rules, access control, and regular
              security reviews. However, no internet transmission is completely secure and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">10. International Transfers</h2>
            <p className="text-sm text-gray-700">
              As a booking agent operating globally, your data may be transferred to and
              processed in countries other than your country of residence. Where such
              transfers occur, we ensure appropriate safeguards are in place (e.g.,
              Standard Contractual Clauses for transfers from the EEA).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">11. Contact &amp; Complaints</h2>
            <p className="text-sm text-gray-700">
              For privacy enquiries or to exercise your rights, contact our Data Protection
              contact at{" "}
              <a href={`mailto:${EMAIL}`} className="text-[var(--color-gold-dark)] underline">{EMAIL}</a>.
              If you are dissatisfied with our response, you may lodge a complaint with the
              relevant data protection authority in your country of residence.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">12. Policy Updates</h2>
            <p className="text-sm text-gray-700">
              We may update this Privacy Policy from time to time. Significant changes will
              be communicated by email or prominently on our website. The effective date at
              the top of this page reflects the most recent revision.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/terms"        className="text-[var(--color-gold-dark)] hover:underline">Terms &amp; Conditions</Link>
          <Link href="/cancellation" className="text-[var(--color-gold-dark)] hover:underline">Cancellation Policy</Link>
          <Link href="/book"         className="text-[var(--color-gold-dark)] hover:underline">Book Your Stay</Link>
        </div>
      </div>
    </div>
  );
}
