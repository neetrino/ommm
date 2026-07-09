export type HomeHeroLogoMarkVideoPlayback = {
  startFromBeginning: () => void;
  pause: () => void;
  dispose: () => void;
};

/** Native muted loop — ping-pong cycle is baked into the MP4 asset (forward + reverse). */
export function createHomeHeroLogoMarkVideoPlayback(
  video: HTMLVideoElement,
): HomeHeroLogoMarkVideoPlayback {
  let active = false;

  video.loop = true;
  video.muted = true;
  video.playsInline = true;

  const tryPlay = (): void => {
    if (!active) {
      return;
    }
    void video.play().catch(() => {
      /* Autoplay may be blocked until user gesture. */
    });
  };

  const onCanPlay = (): void => {
    tryPlay();
  };

  video.addEventListener("canplay", onCanPlay);

  const startFromBeginning = (): void => {
    active = true;
    video.currentTime = 0;
    tryPlay();
  };

  const pause = (): void => {
    active = false;
    video.pause();
  };

  const dispose = (): void => {
    pause();
    video.removeEventListener("canplay", onCanPlay);
  };

  return { startFromBeginning, pause, dispose };
};
