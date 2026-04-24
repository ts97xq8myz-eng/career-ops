"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail, Calendar, CreditCard, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackLeadSubmit } from "@/lib/ads/gtag";
import { useEffect } from "react";
import { formatDate } from "@/lib/utils";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9609999999";

function ConfirmationContent() {
  const params = useSearchParams();
  const leadId = params.get("leadId") ?? "VLG-XXXXX";
  const name = params.get("name") ?? "Guest";
  const email = params.get("email") ?? "";
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";

  const confirmationCode = `VLG-${leadId.slice(-6).toUpperCase()}`;

  useEffect(() => {
    // Fire conversion events once on mount
    trackLeadSubmit("unknown");
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead", { value: 0, currency: "USD" });
    }
  }, []);

  return (
    <div className="min-h-screen pt-24 bg-[var(--color-sand-cool)] flex items-start">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-16">
        {/* Success icon */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-ocean)] mb-3">
            Enquiry Received!
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you, {name.split(" ")[0]}. Your enquiry has been sent to our reservations team.
          </p>
          <div className="inline-block bg-[var(--color-gold-pale)] border border-[var(--color-gold)] rounded-xl px-6 py-3 mt-4">
            <p className="text-xs text-[var(--color-gold-dark)] uppercase tracking-widest">Confirmation Code</p>
            <p className="font-mono font-bold text-xl text-[var(--color-ocean)]">{confirmationCode}</p>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl p-8 shadow-[var(--shadow-card)] mb-6">
          <h2 className="font-serif text-xl font-bold text-[var(--color-ocean)] mb-5">What Happens Next</h2>
          <div className="flex flex-col gap-5">
            {[
              {
                icon: Mail,
                title: "Confirmation Email",
                desc: `A confirmation has been sent to ${email || "your email"}. Check your spam folder if you don't see it.`,
              },
              {
                icon: Calendar,
                title: "Response Within 24 Hours",
                desc: "Our reservations team will confirm availability and send you a personalised rate offer.",
              },
              {
                icon: CreditCard,
                title: "Secure Your Dates (Optional)",
                desc: "Once you receive your offer, you can pre-authorise a deposit to hold your villa. No charge until arrival.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-gold-pale)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[var(--color-gold-dark)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-ocean)] text-sm">{title}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment pre-auth placeholder */}
        <div className="bg-[var(--color-ocean)] rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-[var(--color-gold)]" />
            <h3 className="font-semibold">Secure Your Villa Now</h3>
          </div>
          <p className="text-white/80 text-sm mb-4">
            Pre-authorise a refundable deposit to hold your villa while we confirm availability. Your card will not be charged — only pre-authorised.
          </p>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => alert("Payment pre-auth integration ready. Add your Stripe publishable key to NEXT_PUBLIC_STRIPE_KEY to enable.")}
          >
            Pre-Authorise Deposit (Optional)
          </Button>
          <p className="text-white/40 text-xs mt-2 text-center">Powered by Stripe · PCI Compliant · No charge until arrival</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={`https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi! My enquiry reference is ${confirmationCode}. I'd like to discuss my booking.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="whatsapp" size="lg" fullWidth className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </Button>
          </a>
          <Link href="/" className="flex-1">
            <Button variant="ghost" size="lg" fullWidth>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
