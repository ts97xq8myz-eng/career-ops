"use client";

import { Player } from "@remotion/player";
import { VillaShowcase } from "@/remotion/compositions/VillaShowcase";

export function VillaPlayer() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-[var(--shadow-hero)]" style={{ aspectRatio: "16/9" }}>
      <Player
        component={VillaShowcase}
        durationInFrames={480}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        autoPlay
        loop
        controls={false}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
