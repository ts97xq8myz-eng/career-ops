export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function trackMetaEvent(event: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
}

export function trackLead(villaCategory: string, value?: number): void {
  trackMetaEvent("Lead", { content_name: villaCategory, value, currency: "USD" });
}

export function trackPageView(): void {
  trackMetaEvent("PageView");
}

export function trackInitiateCheckout(villaCategory: string, value: number): void {
  trackMetaEvent("InitiateCheckout", {
    content_name: villaCategory,
    value,
    currency: "USD",
  });
}
