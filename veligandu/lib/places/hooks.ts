"use client";

import { useState, useEffect } from "react";

// Module-level cache — shared across all component instances
let cache: string[] | null = null;
let inflight: Promise<string[]> | null = null;

async function fetchPhotos(count: number): Promise<string[]> {
  if (cache !== null) return cache;
  if (!inflight) {
    inflight = fetch(`/api/places/photos?count=${count}`)
      .then((r) => r.json())
      .then(({ photos }: { photos: string[] }) => {
        cache = photos ?? [];
        return cache;
      })
      .catch(() => {
        cache = [];
        return cache;
      });
  }
  return inflight;
}

export function usePlacePhotos(count = 20): { photos: string[]; loading: boolean } {
  const [photos, setPhotos] = useState<string[]>(cache ?? []);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache !== null) {
      setPhotos(cache);
      setLoading(false);
      return;
    }
    fetchPhotos(count).then((p) => {
      setPhotos(p);
      setLoading(false);
    });
  }, [count]);

  return { photos, loading };
}
