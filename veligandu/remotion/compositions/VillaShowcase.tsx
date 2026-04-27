import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Sequence,
} from "remotion";
import { VILLA_PHOTO_GROUPS } from "../../lib/data/places-photos";

const VILLAS = [
  {
    category: "overwater",
    name: "Classic Overwater Villa",
    label: "OVERWATER VILLA",
    from: "$850",
    highlight: "Glass floor panels · Direct lagoon access",
  },
  {
    category: "beach",
    name: "Beachfront Villa",
    label: "BEACH VILLA",
    from: "$650",
    highlight: "Private beach terrace · Garden bathroom",
  },
  {
    category: "sunset-overwater",
    name: "Sunset Overwater Villa",
    label: "SUNSET OVERWATER",
    from: "$1,100",
    highlight: "West-facing · Private plunge pool",
  },
  {
    category: "honeymoon",
    name: "Honeymoon Suite",
    label: "HONEYMOON SUITE",
    from: "$1,400",
    highlight: "Dedicated butler · Sunset cruise included",
  },
];

const VILLA_DURATION = 120; // 4 seconds per villa
const TRANSITION = 24;

function VillaSlide({ villa, localFrame, fps }: {
  villa: typeof VILLAS[0];
  localFrame: number;
  fps: number;
}) {
  const photos = VILLA_PHOTO_GROUPS[villa.category] ?? [];

  // Ken Burns on primary photo
  const scale = interpolate(localFrame, [0, VILLA_DURATION], [1, 1.06], {
    extrapolateRight: "clamp",
  });
  const slideOpacity = interpolate(
    localFrame,
    [0, TRANSITION, VILLA_DURATION - TRANSITION, VILLA_DURATION],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const labelOpacity = spring({ frame: localFrame - 10, fps, config: { damping: 14, stiffness: 80 } });
  const nameOpacity = spring({ frame: localFrame - 20, fps, config: { damping: 14, stiffness: 80 } });
  const detailOpacity = spring({ frame: localFrame - 35, fps, config: { damping: 14, stiffness: 80 } });

  const nameY = interpolate(localFrame - 20, [0, 20], [24, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Thumbnail strip (photos 1 & 2)
  const thumbOpacity = spring({ frame: localFrame - 45, fps, config: { damping: 12, stiffness: 60 } });

  return (
    <AbsoluteFill style={{ opacity: slideOpacity }}>
      {/* Main photo */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <Img
          src={photos[0]}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(11,36,71,0.75) 0%, rgba(11,36,71,0.1) 60%, transparent 100%)",
          }}
        />
      </div>

      {/* Left text panel */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 64px",
          pointerEvents: "none",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            style={{
              color: "#C9A96E",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              opacity: labelOpacity,
              marginBottom: 12,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {villa.label}
          </p>
          <h2
            style={{
              color: "#ffffff",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.1,
              opacity: nameOpacity,
              transform: `translateY(${nameY}px)`,
              marginBottom: 12,
              fontFamily: "Georgia, serif",
            }}
          >
            {villa.name}
          </h2>
          <div style={{ height: 2, width: 60, background: "#C9A96E", marginBottom: 20, opacity: nameOpacity }} />
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 16,
              opacity: detailOpacity,
              marginBottom: 8,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {villa.highlight}
          </p>
          <p
            style={{
              color: "#C9A96E",
              fontSize: 28,
              fontWeight: 700,
              opacity: detailOpacity,
              fontFamily: "Georgia, serif",
            }}
          >
            From {villa.from}
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: 400 }}> /night</span>
          </p>
        </div>
      </AbsoluteFill>

      {/* Thumbnail strip — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          display: "flex",
          gap: 12,
          opacity: thumbOpacity,
        }}
      >
        {photos.slice(1, 3).map((src, i) => (
          <div
            key={i}
            style={{
              width: 120,
              height: 80,
              borderRadius: 8,
              overflow: "hidden",
              border: "2px solid rgba(201,169,110,0.6)",
            }}
          >
            <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

export function VillaShowcase() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#0B2447" }}>
      {VILLAS.map((villa, i) => {
        const start = i * VILLA_DURATION;
        const localFrame = frame - start;
        if (localFrame < -TRANSITION || localFrame > VILLA_DURATION + TRANSITION) return null;
        return (
          <Sequence key={villa.category} from={start} durationInFrames={VILLA_DURATION}>
            <VillaSlide villa={villa} localFrame={Math.max(0, frame - start)} fps={fps} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
