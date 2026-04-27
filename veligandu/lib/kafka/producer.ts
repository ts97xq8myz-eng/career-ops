import type { KafkaTopic, KafkaEvent } from "@/types";
import { createKafkaProducer } from "./adapter";

const producer = createKafkaProducer();

export async function publishEvent<T>(event: KafkaEvent<T>): Promise<void> {
  await producer.send(event.topic, [
    {
      key: event.key,
      value: JSON.stringify(event),
    },
  ]);
}

export function makeEvent<T>(
  topic: KafkaTopic,
  key: string,
  value: T,
  source: KafkaEvent["source"] = "function"
): KafkaEvent<T> {
  return { topic, key, value, source, timestamp: new Date().toISOString() };
}
