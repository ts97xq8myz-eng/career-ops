export type KafkaTopic =
  | "inventory-updates"
  | "rate-updates"
  | "lead-created"
  | "conversion-events"
  | "payment-preauth-created"
  | "flight-search-clicked";

export interface KafkaEvent<T = unknown> {
  topic: KafkaTopic;
  key: string;
  value: T;
  timestamp: string;
  source: "web" | "admin" | "function" | "webhook";
}

export interface ConversionEvent {
  leadId: string;
  villaCategory: string;
  value?: number;
  currency?: string;
  utmSource?: string;
  utmCampaign?: string;
  gclid?: string;
  fbclid?: string;
  timestamp: string;
}

export interface AuditLog {
  id?: string;
  action: string;
  entityType: "lead" | "rate" | "villa" | "admin" | "payment" | "inventory";
  entityId: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
}
