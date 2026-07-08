import React from "react";
import { Composition } from "remotion";
import { RankingVideo } from "./RankingVideo";
import { FPS } from "./data";
import { calculateSceneMetadata } from "./calculateMetadata";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={RankingVideo}
        durationInFrames={90}
        fps={FPS}
        width={2560}
        height={1440}
        defaultProps={{ sceneTimings: [] }}
        calculateMetadata={calculateSceneMetadata}
      />
    </>
  );
};
