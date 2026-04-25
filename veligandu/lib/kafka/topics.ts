// Kafka topic names — must match your broker configuration
export const KAFKA_TOPICS = {
  RATES_LIVE:            "veligandu.rates.live",
  INVENTORY_LIVE:        "veligandu.inventory.live",
  BOOKINGS_CONFIRMED:    "veligandu.bookings.confirmed",
  RATES_DEAD_LETTER:     "veligandu.rates.dlq",
  INVENTORY_DEAD_LETTER: "veligandu.inventory.dlq",
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

// ── Message schemas ────────────────────────────────────────────────────────────

/** Published by the PMS/channel manager when rates change */
export interface KafkaRateMessage {
  villaCategory: "overwater" | "beach" | "sunset-overwater" | "honeymoon";
  directRate: number;       // USD, excl. tax
  publicRate?: number;      // OTA reference rate (excl. tax)
  currency: string;         // ISO-4217, e.g. "USD"
  mealPlan: string;         // "RO" | "BB" | "HB" | "FB" | "AI"
  dateFrom: string;         // ISO date "YYYY-MM-DD"
  dateTo: string;           // ISO date "YYYY-MM-DD"
  availability: number;     // units available across date range
  minStay: number;
  source: string;           // "pms" | "cm" | "manual"
  timestamp: string;        // ISO-8601 UTC
}

/** Published by the PMS when room availability changes */
export interface KafkaInventoryMessage {
  villaCategory: "overwater" | "beach" | "sunset-overwater" | "honeymoon";
  date: string;             // ISO date, "YYYY-MM-DD"
  available: number;        // rooms available on this date
  totalRooms: number;
  heldRooms?: number;       // rooms held/blocked
  source: string;
  timestamp: string;
}

/** Published when a booking is confirmed (reduces inventory) */
export interface KafkaBookingConfirmedMessage {
  bookingId: string;
  villaCategory: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rateApplied: number;
  source: string;
  timestamp: string;
}

/** Confluent HTTP Sink Connector envelope */
export interface ConfluentSinkRecord {
  topic: string;
  key: string | null;
  value: string;          // JSON-encoded message
  partition: number;
  offset: number;
  timestamp: number;
}

/** Either a raw message or a Confluent HTTP Sink envelope array */
export type KafkaWebhookPayload =
  | ConfluentSinkRecord[]
  | KafkaRateMessage
  | KafkaInventoryMessage
  | KafkaRateMessage[]
  | KafkaInventoryMessage[];
