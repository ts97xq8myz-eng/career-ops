import type { KafkaTopic } from "@/types";

export interface KafkaMessage {
  key?: string;
  value: string;
}

export interface KafkaProducer {
  send(topic: KafkaTopic, messages: KafkaMessage[]): Promise<void>;
  disconnect(): Promise<void>;
}

export interface KafkaConsumer {
  subscribe(topic: KafkaTopic, handler: (msg: KafkaMessage) => Promise<void>): Promise<void>;
  disconnect(): Promise<void>;
}

/** Mock in-memory adapter — used when KAFKA_ENABLED !== 'true' */
export class MockKafkaProducer implements KafkaProducer {
  async send(topic: KafkaTopic, messages: KafkaMessage[]): Promise<void> {
    for (const msg of messages) {
      console.log(`[Kafka:mock] topic=${topic} key=${msg.key ?? "-"} value=${msg.value}`);
    }
  }
  async disconnect(): Promise<void> {}
}

/** Real KafkaJS adapter — only instantiated when KAFKA_ENABLED=true */
export class RealKafkaProducer implements KafkaProducer {
  private producer: import("kafkajs").Producer | null = null;

  private async getProducer() {
    if (this.producer) return this.producer;
    const { Kafka } = await import("kafkajs");
    const kafka = new Kafka({
      clientId: "veligandu-booking",
      brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
    });
    this.producer = kafka.producer();
    await this.producer.connect();
    return this.producer;
  }

  async send(topic: KafkaTopic, messages: KafkaMessage[]): Promise<void> {
    try {
      const producer = await this.getProducer();
      await producer.send({
        topic,
        messages: messages.map((m) => ({
          key: m.key,
          value: m.value,
        })),
      });
    } catch (err) {
      console.error("[Kafka:real] send failed, swallowing:", err);
    }
  }

  async disconnect(): Promise<void> {
    await this.producer?.disconnect();
    this.producer = null;
  }
}

export function createKafkaProducer(): KafkaProducer {
  if (process.env.KAFKA_ENABLED === "true" && process.env.KAFKA_BROKERS) {
    return new RealKafkaProducer();
  }
  return new MockKafkaProducer();
}
