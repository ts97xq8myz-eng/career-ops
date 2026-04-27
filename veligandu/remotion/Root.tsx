import { Composition } from "remotion";
import { HeroLoop } from "./compositions/HeroLoop";
import { VillaShowcase } from "./compositions/VillaShowcase";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="HeroLoop"
        component={HeroLoop}
        durationInFrames={900} // 30 seconds at 30fps (10 photos × 3s)
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="VillaShowcase"
        component={VillaShowcase}
        durationInFrames={480} // 16 seconds at 30fps (4 villas × 4s)
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
}
