"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X, Mail, MessageCircle, CheckCircle2, Loader2, Copy, ExternalLink, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { httpsCallable } from "firebase/functions";
import { getClientFunctions } from "@/lib/firebase/client";
import { trackLeadSubmit } from "@/lib/ads/gtag";
import { formatQuoteWhatsApp } from "@/lib/rates/calculator";
import type { StayQuote } from "@/lib/rates/calculator";
import { VILLAS_SEED } from "@/lib/data/villas";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName:         z.string().min(2, "Full name required"),
  email:            z.string().email("Valid email required"),
  phone:            z.string().min(7, "Phone / WhatsApp number required"),
  preferredContact: z.enum(["email", "whatsapp"]),
  message:          z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVillaName(category: string): string {
  return VILLAS_SEED.find((v) => v.category === category)?.name ?? category;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ContactOption({
  value,
  label,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  value:       "email" | "whatsapp";
  label:       string;
  description: string;
  icon:        React.ElementType;
  selected:    boolean;
  onClick:     () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all w-full",
        selected
          ? value === "whatsapp"
            ? "border-green-500 bg-green-50"
            : "border-[var(--color-ocean)] bg-[var(--color-sand)]"
          : "border-gray-200 hover:border-gray-300 bg-white"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
        selected
          ? value === "whatsapp" ? "bg-green-500 text-white" : "bg-[var(--color-ocean)] text-white"
          : "bg-gray-100 text-gray-400"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className={cn("font-semibold text-sm", selected ? "text-[var(--color-ocean)]" : "text-gray-700")}>
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className={cn(
        "ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
        selected ? "border-[var(--color-ocean)] bg-[var(--color-ocean)]" : "border-gray-300"
      )}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

// ─── Success State — Email ────────────────────────────────────────────────────

function EmailSuccess({ quote, name }: { quote: StayQuote; name: string }) {
  return (
    <div className="text-center py-6 px-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <div>
        <h3 className="font-serif text-xl font-bold text-[var(--color-ocean)]">Offer Sent, {name.split(" ")[0]}!</h3>
        <p className="text-gray-500 text-sm mt-1">Check your inbox — your personalised offer is on its way.</p>
      </div>
      <div className="bg-[var(--color-sand)] rounded-xl p-4 text-left text-sm space-y-2">
        <p className="font-semibold text-[var(--color-ocean)] text-xs uppercase tracking-wider">What&apos;s in the email</p>
        {[
          `All-inclusive total: ${formatCurrency(quote.directTotal)}`,
          `Savings vs OTA: ${formatCurrency(quote.savingsValue)} (${quote.savingsPercent}%)`,
          "Full tax & transfer breakdown",
          "How to confirm your reservation",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-gold)] flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Confirmation expected within 24 hours. Check your spam folder if you don&apos;t see it.
      </p>
    </div>
  );
}

// ─── Success State — WhatsApp ─────────────────────────────────────────────────

function WhatsAppSuccess({ quote, name }: { quote: StayQuote; name: string }) {
  const villaName   = getVillaName(quote.villaCategory);
  const message     = formatQuoteWhatsApp(quote, villaName, name);
  const encoded     = encodeURIComponent(message);
  const waNumber    = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+9607779519").replace(/\D/g, "");
  const waUrl       = `https://wa.me/${waNumber}?text=${encoded}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="py-4 px-2 space-y-4">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="font-serif text-xl font-bold text-[var(--color-ocean)]">
          Your offer is ready, {name.split(" ")[0]}!
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Click below to open WhatsApp — your personalised rate offer is pre-loaded and ready to send.
        </p>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 max-h-48 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Message Preview</p>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy Text"}
        </button>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white py-3 text-sm font-semibold transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Open WhatsApp
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <p className="text-xs text-center text-gray-400">
        Alternatively, email us at{" "}
        <a href="mailto:veligandu@reservationsandsales.com" className="text-[var(--color-gold)] underline">
          veligandu@reservationsandsales.com
        </a>
      </p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface EnquiryModalProps {
  quote:    StayQuote;
  onClose:  () => void;
}

export function EnquiryModal({ quote, onClose }: EnquiryModalProps) {
  const [step, setStep]         = useState<"form" | "success-email" | "success-whatsapp">("form");
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const villaName = getVillaName(quote.villaCategory);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferredContact: "email" },
  });

  const preferredContact = watch("preferredContact");

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setApiError(null);

    try {
      const submitLeadFn = httpsCallable<Record<string, unknown>, { leadId: string }>(
        getClientFunctions(),
        "submitLead"
      );

      await submitLeadFn({
        fullName:         data.fullName,
        email:            data.email,
        phone:            data.phone,
        preferredContact: data.preferredContact,
        message:          data.message ?? "",
        // Stay details from quote
        checkIn:          quote.checkIn,
        checkOut:         quote.checkOut,
        villaCategory:    quote.villaCategory,
        adults:           quote.adults,
        children:         quote.children,
        // Quote snapshot — full breakdown so the email formatter gets exact values
        quote: {
          nights:            quote.nights,
          publicNightlyRate: quote.publicNightlyRate,
          publicTotal:       quote.publicTotal,
          directNightlyRate: quote.directNightlyRate,
          directSubtotal:    quote.directSubtotal,
          taxGst:            quote.taxes.gst,
          taxServiceCharge:  quote.taxes.serviceCharge,
          taxGreenTax:       quote.taxes.greenTax,
          taxTotal:          quote.taxes.total,
          transferCost:      quote.transferCost,
          directTotal:       quote.directTotal,
          savingsValue:      quote.savingsValue,
          savingsPercent:    quote.savingsPercent,
        },
        selectedRate:      quote.directNightlyRate,
        // Required by existing schema
        country:           "—",
        nearestAirport:    "MLE",
        budget:            "direct-enquiry",
      });

      trackLeadSubmit(quote.villaCategory, quote.directNightlyRate);

      setSubmittedName(data.fullName);
      setStep(data.preferredContact === "whatsapp" ? "success-whatsapp" : "success-email");
    } catch (err) {
      console.error(err);
      setApiError("Something went wrong. Please try again or contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-gold)]">Direct Booking</p>
            <h2 className="font-serif text-lg font-bold text-[var(--color-ocean)] leading-tight">
              {step === "form" ? "Unlock Your Exclusive Rate" : "Your Offer is Ready"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 pb-6">
          {step === "form" && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Quote summary strip */}
              <div className="my-5 bg-[var(--color-ocean)] rounded-xl px-5 py-4 text-white">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-gold)] uppercase tracking-wider mb-1">{villaName}</p>
                    <p className="text-sm text-white/80">
                      {quote.checkIn} → {quote.checkOut} · {quote.nights} night{quote.nights !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-white/60 mt-0.5">
                      {quote.adults} adult{quote.adults !== 1 ? "s" : ""}{quote.children > 0 ? ` · ${quote.children} child${quote.children !== 1 ? "ren" : ""}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/50 uppercase">All-inclusive</p>
                    <p className="font-serif text-2xl font-bold text-white">{formatCurrency(quote.directTotal)}</p>
                    <p className="text-xs text-emerald-400">Saves {formatCurrency(quote.savingsValue)} vs OTA</p>
                  </div>
                </div>
              </div>

              {/* Contact method */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                  How would you like to receive your offer?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ContactOption
                    value="email"
                    label="Email"
                    description="Full breakdown sent to your inbox"
                    icon={Mail}
                    selected={preferredContact === "email"}
                    onClick={() => setValue("preferredContact", "email")}
                  />
                  <ContactOption
                    value="whatsapp"
                    label="WhatsApp"
                    description="Structured message ready to send"
                    icon={MessageCircle}
                    selected={preferredContact === "whatsapp"}
                    onClick={() => setValue("preferredContact", "whatsapp")}
                  />
                </div>
              </div>

              {/* Guest details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Full Name
                  </label>
                  <input
                    {...register("fullName")}
                    placeholder="As on passport"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[var(--color-ocean)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@email.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[var(--color-ocean)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    {preferredContact === "whatsapp" ? "WhatsApp Number" : "Phone / WhatsApp"}
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[var(--color-ocean)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
                    Special Requests <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    {...register("message")}
                    rows={2}
                    placeholder="Honeymoon, dietary requirements, celebrations…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[var(--color-ocean)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow resize-none"
                  />
                </div>
              </div>

              {apiError && (
                <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {apiError}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? "Sending…" : preferredContact === "whatsapp"
                    ? "Prepare My WhatsApp Offer"
                    : "Send My Exclusive Offer"
                  }
                </Button>
                <p className="text-xs text-center text-gray-400">
                  No payment required. Response guaranteed within 24 hours.
                </p>
              </div>
            </form>
          )}

          {step === "success-email" && (
            <EmailSuccess quote={quote} name={submittedName} />
          )}

          {step === "success-whatsapp" && (
            <WhatsAppSuccess quote={quote} name={submittedName} />
          )}
        </div>
      </div>
    </div>
  );
}
