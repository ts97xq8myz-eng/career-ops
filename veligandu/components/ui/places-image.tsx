import Image from "next/image";
import { getPlacesPhoto } from "@/lib/data/places-photos";

interface PlacesImageProps {
  /** Which photo index to use (0–9, wraps around) */
  index?: number;
  /** Shown if the Places photo fails to load */
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
  const src = getPlacesPhoto(index);

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
