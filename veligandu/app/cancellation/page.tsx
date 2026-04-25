import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "Veligandu Island Resort cancellation and modification policy for direct bookings managed by Reservations & Sales.",
};

const EMAIL = "veligandu@reservationsandsales.com";

export default function CancellationPage() {
  return (
    <div className="min-h-screen pt-24 bg-[var(--color-sand-cool)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="text-[var(--color-gold-dark)] text-xs font-semibold uppercase tracking-widest mb-2">Legal</p>
          <h1 className="font-serif text-4xl font-bold text-[var(--color-ocean)] mb-3">
            Cancellation Policy
          </h1>
          <p className="text-[var(--color-ocean-muted)] text-sm">
            Applies to all direct bookings managed by Reservations &amp; Sales for Veligandu Island Resort.
          </p>
        </div>

        {/* Summary table */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="font-serif text-xl font-bold text-[var(--color-ocean)] mb-6">
            At-a-Glance Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-6 font-semibold text-[var(--color-ocean)] w-1/2">Notice Period</th>
                  <th className="text-left py-3 font-semibold text-[var(--color-ocean)]">Charge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { period: "60+ days before arrival",     charge: "Deposit only (30%)" },
                  { period: "30–59 days before arrival",   charge: "50% of total booking value" },
                  { period: "15–29 days before arrival",   charge: "75% of total booking value" },
                  { period: "0–14 days before arrival",    charge: "100% — no refund" },
                  { period: "No-show",                     charge: "100% — no refund" },
                  { period: "Peak season (20 Dec–5 Jan, Easter, Eid)", charge: "100% within 60 days" },
                ].map(({ period, charge }) => (
                  <tr key={period} className="hover:bg-gray-50">
                    <td className="py-3.5 pr-6 text-gray-700 font-medium">{period}</td>
                    <td className="py-3.5 text-gray-600">{charge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            All dates refer to the local Maldivian time (UTC+5) at the time of cancellation request.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm space-y-8 text-[var(--color-ocean)] leading-relaxed">

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">1. Standard Cancellation Policy</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>
                <strong>60 or more days before arrival:</strong> Your deposit (30% of total booking value) is forfeited. Any balance paid beyond the deposit will be refunded in full within 14 business days.
              </li>
              <li>
                <strong>30–59 days before arrival:</strong> A cancellation fee equivalent to 50% of the total booking value is charged. Any amount paid exceeding this will be refunded.
              </li>
              <li>
                <strong>15–29 days before arrival:</strong> A cancellation fee equivalent to 75% of the total booking value applies. No refund beyond this amount.
              </li>
              <li>
                <strong>0–14 days before arrival or no-show:</strong> The full booking value is charged. No refund is made.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">2. Peak Season Policy</h2>
            <p className="text-sm text-gray-700 mb-2">
              For reservations including arrival or departure dates falling within any of the following peak periods, a stricter cancellation policy applies:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mb-3">
              <li>Christmas &amp; New Year: 20 December – 5 January</li>
              <li>Easter: 10 days centred on Easter Sunday</li>
              <li>Eid Al-Fitr and Eid Al-Adha: ±5 days from the official date</li>
              <li>Maldives Independence Day peak windows as advised</li>
            </ul>
            <p className="text-sm text-gray-700">
              <strong>Peak season cancellation:</strong> A cancellation fee of 100% of the total booking value applies for any cancellation made within 60 days of arrival.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">3. Modifications</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>Date changes or villa category changes are treated as a cancellation of the original booking and re-booking at the current rate, subject to availability.</li>
              <li>Shortening of stay: if you depart before your confirmed check-out date, the original booking value for all nights remains chargeable.</li>
              <li>Modifications requested more than 60 days before arrival will be accommodated where possible without penalty, subject to availability and any rate differences.</li>
              <li>Changes to the number of guests in the villa are subject to the applicable rate differential and must be approved in writing.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">4. How to Cancel</h2>
            <p className="text-sm text-gray-700 mb-2">
              All cancellation requests must be submitted <strong>in writing</strong> to:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                Email:{" "}
                <a href={`mailto:${EMAIL}`} className="text-[var(--color-gold-dark)] underline">{EMAIL}</a>
              </li>
              <li>WhatsApp: +960 777 9519 (confirmation via email required)</li>
            </ul>
            <p className="text-sm text-gray-700 mt-3">
              The cancellation date is the date on which written confirmation of receipt is issued by Reservations &amp; Sales. Verbal or WhatsApp-only cancellations without written confirmation are not binding.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">5. Refund Processing</h2>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>Eligible refunds are processed within 14 business days of the cancellation confirmation date.</li>
              <li>Refunds are made via the original payment method where possible. Bank transfer fees incurred during the refund are deducted from the refund amount.</li>
              <li>Credit card processing fees (3.5%) are non-refundable.</li>
              <li>Refunds are made in USD at the rate applied to the original payment. Currency conversion losses are not compensated.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">6. Force Majeure &amp; Exceptional Circumstances</h2>
            <p className="text-sm text-gray-700">
              In the event of cancellation due to force majeure (natural disaster, pandemic, government travel ban, or similar), Reservations &amp; Sales will work with the Resort to offer date changes or credit vouchers where commercially possible. This is offered in good faith and does not constitute a legal obligation to provide a cash refund. We strongly recommend comprehensive travel insurance that includes cancellation cover for all eventualities.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">7. Travel Insurance — Strongly Recommended</h2>
            <p className="text-sm text-gray-700">
              We strongly recommend all guests purchase comprehensive travel insurance at the time of booking, covering: trip cancellation, medical expenses, emergency evacuation, personal liability, and loss of personal property. Veligandu Island Resort and Reservations &amp; Sales accept no liability for uninsured losses.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">8. Resort Closures</h2>
            <p className="text-sm text-gray-700">
              In the unlikely event of a partial or full closure of Veligandu Island Resort during your confirmed stay period (due to renovation, force majeure, or other causes), we will endeavour to notify you as soon as reasonably practicable and offer alternative dates, an equivalent property, or a full refund of amounts paid, at your choice.
            </p>
          </section>

        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/terms"   className="text-[var(--color-gold-dark)] hover:underline">Terms &amp; Conditions</Link>
          <Link href="/privacy" className="text-[var(--color-gold-dark)] hover:underline">Privacy Policy</Link>
          <Link href="/book"    className="text-[var(--color-gold-dark)] hover:underline">Book Your Stay</Link>
        </div>
      </div>
    </div>
  );
}
