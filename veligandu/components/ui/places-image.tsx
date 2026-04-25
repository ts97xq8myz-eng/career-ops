"use client";

import Image from "next/image";
import { usePlacePhotos } from "@/lib/places/hooks";

interface PlacesImageProps {
  /** Which photo index to use from the Google Places results (0 = first/best photo) */
  index?: number;
  /** Unsplash or other URL shown until Places photos load, or if Places API is unconfigured */
  fallback: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export function PlacesImage({
  index = 0,
  fallback,
  alt,
  className,
  fill,
  width,
  height,
  priority,
  sizes,
}: PlacesImageProps) {
  const { photos } = usePlacePhotos(index + 1);
  const src = photos[index] ?? fallback;

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1600px"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1600}
      height={height ?? 900}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
