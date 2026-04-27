export const GTAG_ID = process.env.NEXT_PUBLIC_GTAG_ID ?? "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackConversion(eventName: string, value?: number, currency = "USD"): void {
  if (typeof window === "undefined" || !window.gtag || !GTAG_ID) return;
  window.gtag("event", "conversion", {
    send_to: `${GTAG_ID}/${eventName}`,
    value,
    currency,
  });
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

export function trackLeadSubmit(villaCategory: string, value?: number): void {
  trackConversion("lead_submit", value);
  trackEvent("generate_lead", {
    currency: "USD",
    value,
    item_category: villaCategory,
  });
}

export function trackBookingEngineOpened(villaCategory: string): void {
  trackEvent("begin_checkout", { item_category: villaCategory });
}
