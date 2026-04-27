import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  Sequence,
} from "remotion";
import { VELIGANDU_PHOTOS } from "../../lib/data/places-photos";

// 10 photos × 90 frames each = 900 frames total at 30fps = 30 seconds, looping
const PHOTO_DURATION = 90; // 3 seconds per photo
const TRANSITION = 20;      // 0.67s crossfade
const PHOTOS = VELIGANDU_PHOTOS;

function PhotoSlide({ src, startFrame }: { src: string; startFrame: number }) {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  // Ken Burns: slow zoom in from 1.0 → 1.08
  const scale = interpolate(local, [0, PHOTO_DURATION], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  // Fade in at start of slide
  const fadeIn = interpolate(local, [0, TRANSITION], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  // Fade out at end of slide
  const fadeOut = interpolate(
    local,
    [PHOTO_DURATION - TRANSITION, PHOTO_DURATION],
    [1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
    </AbsoluteFill>
  );
}

function GoldDivider({ delay }: { delay: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 80 } });
  return (
    <div
      style={{
        height: 2,
        width: `${progress * 80}px`,
        background: "#C9A96E",
        marginBottom: 24,
      }}
    />
  );
}

function TextOverlay() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowOpacity = spring({ frame: frame - 10, fps, config: { damping: 14 } });
  const titleOpacity = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const subtitleOpacity = spring({ frame: frame - 40, fps, config: { damping: 14 } });

  const eyebrowY = interpolate(frame - 10, [0, 20], [20, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const titleY = interpolate(frame - 20, [0, 25], [30, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const subtitleY = interpolate(frame - 40, [0, 25], [20, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 100%)",
        display: "flex",
        alignItems: "center",
        padding: "0 80px",
      }}
    >
      <div style={{ maxWidth: 700 }}>
        <p
          style={{
            color: "#C9A96E",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: eyebrowOpacity,
            transform: `translateY(${eyebrowY}px)`,
            marginBottom: 16,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Veligandu Island Resort · North Ari Atoll
        </p>
        <h1
          style={{
            color: "#ffffff",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.1,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 0,
            fontFamily: "Georgia, serif",
          }}
        >
          The Maldives,
          <br />
          As It Should Be
        </h1>
        <GoldDivider delay={30} />
        <p
          style={{
            color: "rgba(255,255,255,0.88)",
            fontSize: 20,
            lineHeight: 1.6,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            fontFamily: "system-ui, sans-serif",
            maxWidth: 560,
          }}
        >
          An intimate island paradise where every villa floats above
          turquoise waters and every sunset belongs to you.
        </p>
      </div>
    </AbsoluteFill>
  );
}

export function HeroLoop() {
  const { durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();

  // Which photo set is showing (wraps every PHOTO_DURATION frames)
  const activeSlides = PHOTOS.map((_, i) => {
    const start = i * PHOTO_DURATION;
    return start < durationInFrames;
  });

  return (
    <AbsoluteFill style={{ background: "#0B2447" }}>
      {PHOTOS.map((src, i) => {
        if (!activeSlides[i]) return null;
        const start = i * PHOTO_DURATION;
        // Show this slide only in its window (+ overlap for crossfade)
        if (frame < start - TRANSITION || frame > start + PHOTO_DURATION + TRANSITION) return null;
        return (
          <Sequence key={i} from={start} durationInFrames={PHOTO_DURATION}>
            <PhotoSlide src={src} startFrame={0} />
          </Sequence>
        );
      })}
      <TextOverlay />
    </AbsoluteFill>
  );
}
