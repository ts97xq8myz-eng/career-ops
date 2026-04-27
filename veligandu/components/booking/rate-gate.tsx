"use client";

import { useState } from "react";
import { Mail, Phone, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POPULAR_COUNTRIES = [
  "Australia", "Austria", "Belgium", "Canada", "China", "Denmark",
  "Finland", "France", "Germany", "Hong Kong", "India", "Ireland",
  "Israel", "Italy", "Japan", "Malaysia", "Netherlands", "New Zealand",
  "Norway", "Portugal", "Russia", "Saudi Arabia", "Singapore", "South Korea",
  "Spain", "Sweden", "Switzerland", "Thailand", "United Arab Emirates",
  "United Kingdom", "United States", "Other",
];

interface RateGateProps {
  onUnlock: () => void;
}

type Tab = "email" | "mobile";

export function RateGate({ onUnlock }: RateGateProps) {
  const [tab, setTab]           = useState<Tab>("email");
  const [email, setEmail]       = useState("");
  const [mobile, setMobile]     = useState("");
  const [country, setCountry]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[var(--color-ocean)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow bg-white";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (tab === "email" && !email.includes("@")) {
      setError("Please enter a valid email address."); return;
    }
    if (tab === "mobile" && (!mobile.trim() || !country)) {
      setError("Please enter your mobile number and country."); return;
    }

    setSubmitting(true);
    try {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await setDoc(doc(getDb(), "registrations", id), {
        type:      tab,
        email:     tab === "email" ? email.trim().toLowerCase() : null,
        mobile:    tab === "mobile" ? mobile.trim() : null,
        country:   tab === "mobile" ? country : null,
        source:    "available-page",
        createdAt: serverTimestamp(),
      });

      // Persist unlock in localStorage so it survives navigation
      localStorage.setItem("rs_unlocked", "1");
      setDone(true);
      setTimeout(() => onUnlock(), 800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        <p className="font-semibold text-[var(--color-ocean)] text-lg">Unlocked!</p>
        <p className="text-sm text-gray-500">Revealing your exclusive direct rates…</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-gold)]/15 mb-3">
          <Lock className="w-5 h-5 text-[var(--color-gold)]" />
        </div>
        <h3 className="font-serif text-xl font-bold text-[var(--color-ocean)]">
          Unlock Your Exclusive Rate
        </h3>
        <p className="text-sm text-gray-500 mt-1.5 max-w-xs mx-auto">
          9% below any OTA · All-inclusive with taxes &amp; seaplane · Sent to you directly
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden mb-4">
        {(["email", "mobile"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(""); }}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors",
              tab === t
                ? "bg-[var(--color-ocean)] text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            {t === "email" ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
            {t === "email" ? "Email" : "Mobile"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {tab === "email" ? (
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            autoFocus
            required
          />
        ) : (
          <>
            <input
              type="tel"
              placeholder="+1 212 555 0100"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className={inputCls}
              autoFocus
              required
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputCls}
              required
            >
              <option value="">Select your country</option>
              {POPULAR_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          type="submit"
          disabled={submitting}
          className="mt-1"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Unlocking…</>
            : "Reveal My Direct Rate"
          }
        </Button>

        <p className="text-[10px] text-gray-400 text-center leading-relaxed">
          We&apos;ll send your personalised all-inclusive offer to this address.
          No spam, no third parties — ever.
        </p>
      </form>
    </div>
  );
}
