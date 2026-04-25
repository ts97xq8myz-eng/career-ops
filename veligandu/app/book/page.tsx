"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FlightHelper } from "@/components/booking/flight-helper";
import { RateDisplay } from "@/components/booking/rate-display";
import { SectionHeader } from "@/components/ui/section-header";
import { getFallbackRate } from "@/lib/rates/engine";
import { trackLeadSubmit, trackBookingEngineOpened } from "@/lib/ads/gtag";
import { trackInitiateCheckout } from "@/lib/ads/meta";
import { NEAREST_AIRPORTS, VILLA_CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { httpsCallable } from "firebase/functions";
import { getClientFunctions } from "@/lib/firebase/client";
import { CheckCircle } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number required"),
  country: z.string().min(2, "Country required"),
  nearestAirport: z.string().min(3, "Airport required"),
  checkIn: z.string().min(1, "Check-in date required"),
  checkOut: z.string().min(1, "Check-out date required"),
  adults: z.string().transform((v) => Number(v)),
  children: z.string().transform((v) => Number(v)),
  villaCategory: z.string().min(1, "Please select a villa type"),
  budget: z.string().min(1, "Budget range required"),
  message: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  selectedRate: z.string().optional().transform((v) => (v ? Number(v) : undefined)),
  selectedFlightRedirect: z.string().optional(),
});

type FormData = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const VILLA_OPTIONS = [
  { value: "overwater", label: VILLA_CATEGORY_LABELS["overwater"] },
  { value: "beach", label: VILLA_CATEGORY_LABELS["beach"] },
  { value: "sunset-overwater", label: VILLA_CATEGORY_LABELS["sunset-overwater"] },
  { value: "honeymoon", label: VILLA_CATEGORY_LABELS["honeymoon"] },
];

const BUDGET_OPTIONS = [
  { value: "under-500", label: "Under $500/night" },
  { value: "500-1000", label: "$500 – $1,000/night" },
  { value: "1000-1500", label: "$1,000 – $1,500/night" },
  { value: "over-1500", label: "Over $1,500/night" },
];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function BookFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const checkIn = searchParams.get("checkIn") ?? getTodayStr();
  const checkOut = searchParams.get("checkOut") ?? "";
  const villaCategory = searchParams.get("villaCategory") ?? "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      checkIn,
      checkOut,
      villaCategory,
      adults: String(searchParams.get("adults") ?? "2"),
      children: String(searchParams.get("children") ?? "0"),
      utmSource: searchParams.get("utm_source") ?? undefined,
      utmMedium: searchParams.get("utm_medium") ?? undefined,
      utmCampaign: searchParams.get("utm_campaign") ?? undefined,
    },
  });

  const watchedVilla = watch("villaCategory");
  const rate = getFallbackRate(watchedVilla || "overwater");

  useEffect(() => {
    trackBookingEngineOpened(villaCategory || "unknown");
    trackInitiateCheckout(villaCategory || "unknown", rate.directRatePerNight);
  }, []);

  const onSubmit = async (data: FormOutput) => {
    setLoading(true);
    try {
      const submitLeadFn = httpsCallable<Record<string, unknown>, { leadId: string }>(
        getClientFunctions(),
        "submitLead"
      );
      const result = await submitLeadFn({ ...data, selectedRate: rate.directRatePerNight });
      const { leadId } = result.data;

      trackLeadSubmit(data.villaCategory, rate.directRatePerNight);
      router.push(`/book/confirmation?leadId=${leadId}&name=${encodeURIComponent(data.fullName)}&email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again or contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ["Stay Details", "Your Information", "Preferences"];

  return (
    <div className="min-h-screen pt-24 bg-[var(--color-sand-cool)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionHeader
          eyebrow="Direct Booking"
          title="Reserve Your Stay"
          subtitle="Our reservations team will confirm availability and send a personalised offer within 24 hours."
          centered
        />

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i + 1 < step
                    ? "bg-[var(--color-gold)] text-white"
                    : i + 1 === step
                    ? "bg-[var(--color-ocean)] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden sm:inline text-sm font-medium ${i + 1 === step ? "text-[var(--color-ocean)]" : "text-gray-400"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-gray-200 hidden sm:block" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main form */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Step 1: Stay Details */}
              {step === 1 && (
                <div className="bg-white rounded-2xl p-8 shadow-[var(--shadow-card)]">
                  <h2 className="font-serif text-2xl font-bold text-[var(--color-ocean)] mb-6">Stay Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Check-in Date"
                      type="date"
                      min={getTodayStr()}
                      {...register("checkIn")}
                      error={errors.checkIn?.message}
                      required
                    />
                    <Input
                      label="Check-out Date"
                      type="date"
                      min={watch("checkIn")}
                      {...register("checkOut")}
                      error={errors.checkOut?.message}
                      required
                    />
                    <Select
                      label="Adults"
                      options={[1,2,3,4,5,6].map((n) => ({ value: String(n), label: `${n} Adult${n > 1 ? "s" : ""}` }))}
                      {...register("adults")}
                      error={errors.adults?.message}
                      required
                    />
                    <Select
                      label="Children"
                      options={[0,1,2,3,4].map((n) => ({ value: String(n), label: `${n} Child${n !== 1 ? "ren" : ""}` }))}
                      {...register("children")}
                      error={errors.children?.message}
                      required
                    />
                    <div className="sm:col-span-2">
                      <Select
                        label="Villa Type"
                        options={VILLA_OPTIONS}
                        placeholder="Select villa type..."
                        {...register("villaCategory")}
                        error={errors.villaCategory?.message}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Select
                        label="Budget per Night"
                        options={BUDGET_OPTIONS}
                        placeholder="Select budget range..."
                        {...register("budget")}
                        error={errors.budget?.message}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button type="button" variant="primary" size="lg" onClick={() => setStep(2)}>
                      Continue →
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <div className="bg-white rounded-2xl p-8 shadow-[var(--shadow-card)]">
                  <h2 className="font-serif text-2xl font-bold text-[var(--color-ocean)] mb-6">Your Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <Input
                        label="Full Name"
                        placeholder="As on passport"
                        {...register("fullName")}
                        error={errors.fullName?.message}
                        required
                      />
                    </div>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@email.com"
                      {...register("email")}
                      error={errors.email?.message}
                      required
                    />
                    <Input
                      label="Phone / WhatsApp"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      {...register("phone")}
                      error={errors.phone?.message}
                      required
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Country of Residence"
                        placeholder="United Kingdom"
                        {...register("country")}
                        error={errors.country?.message}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Select
                        label="Nearest Major Airport"
                        options={NEAREST_AIRPORTS.map((a) => ({ value: a.iata, label: `${a.iata} — ${a.city}, ${a.country}` }))}
                        placeholder="Select your airport..."
                        {...register("nearestAirport")}
                        error={errors.nearestAirport?.message}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button type="button" variant="ghost" size="lg" onClick={() => setStep(1)}>← Back</Button>
                    <Button type="button" variant="primary" size="lg" onClick={() => setStep(3)}>Continue →</Button>
                  </div>
                </div>
              )}

              {/* Step 3: Preferences + Submit */}
              {step === 3 && (
                <div className="bg-white rounded-2xl p-8 shadow-[var(--shadow-card)]">
                  <h2 className="font-serif text-2xl font-bold text-[var(--color-ocean)] mb-6">Additional Preferences</h2>
                  <div className="flex flex-col gap-5">
                    <Textarea
                      label="Special Requests or Message"
                      placeholder="Honeymoon? Dietary requirements? Celebration? Tell us anything."
                      {...register("message")}
                    />

                    <FlightHelper
                      checkIn={watch("checkIn")}
                      checkOut={watch("checkOut")}
                      adults={Number(watch("adults"))}
                      children={Number(watch("children"))}
                      onAirportSelect={(iata) => setValue("nearestAirport", iata)}
                    />

                    <div className="bg-[var(--color-sand)] rounded-xl p-4 text-sm text-[var(--color-ocean-muted)]">
                      By submitting this form you agree to our privacy policy. We will respond within 24 hours with a personalised offer. No payment is taken at this stage.
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button type="button" variant="ghost" size="lg" onClick={() => setStep(2)}>← Back</Button>
                    <Button type="submit" variant="primary" size="xl" loading={loading}>
                      Send Enquiry
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: Rate summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-[var(--shadow-card)]">
                  <p className="font-semibold text-[var(--color-ocean)] mb-3 text-sm uppercase tracking-wider">Rate Summary</p>
                  <RateDisplay rate={rate} showDetails={false} />
                </div>
                <div className="bg-[var(--color-ocean)] rounded-2xl p-6 text-white text-sm">
                  <p className="font-semibold mb-2">What happens next?</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-white/80">
                    <li>We confirm availability within 24h</li>
                    <li>You receive a personalised rate offer</li>
                    <li>Optional: secure your dates with a payment pre-authorisation</li>
                    <li>Our team assists with transfers and extras</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center text-[var(--color-ocean)]">Loading...</div>}>
      <BookFormInner />
    </Suspense>
  );
}
