"use client";

import { Player } from "@remotion/player";
import { HeroLoop } from "@/remotion/compositions/HeroLoop";

export function HeroPlayer() {
  return (
    <Player
      component={HeroLoop}
      durationInFrames={900}
      compositionWidth={1920}
      compositionHeight={1080}
      fps={30}
      autoPlay
      loop
      controls={false}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
