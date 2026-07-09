export type HomeHeroLogoMarkPingPongPlayback = {
  startFromBeginning: () => void;
  stop: () => void;
};

function cancelReversePlayback(
  reverseRafId: { current: number },
  reverseLastTimestamp: { current: number },
): void {
  if (reverseRafId.current !== 0) {
    cancelAnimationFrame(reverseRafId.current);
    reverseRafId.current = 0;
  }
  reverseLastTimestamp.current = 0;
}

/** Forward play, then manual reverse scrub — loops ping-pong (no native reverse playback). */
export function createHomeHeroLogoMarkPingPongPlayback(
  video: HTMLVideoElement,
): HomeHeroLogoMarkPingPongPlayback {
  const reverseRafId = { current: 0 };
  const reverseLastTimestamp = { current: 0 };
  let stopped = false;

  const playForward = (): void => {
    if (stopped) {
      return;
    }
    cancelReversePlayback(reverseRafId, reverseLastTimestamp);
    void video.play().catch(() => {
      /* Autoplay may be blocked until user gesture. */
    });
  };

  const stepReverse = (timestamp: number): void => {
    if (stopped) {
      return;
    }
    if (reverseLastTimestamp.current === 0) {
      reverseLastTimestamp.current = timestamp;
    }
    const deltaSec = (timestamp - reverseLastTimestamp.current) / 1000;
    reverseLastTimestamp.current = timestamp;
    video.currentTime = Math.max(0, video.currentTime - deltaSec);
    if (video.currentTime <= 0.01) {
      video.currentTime = 0;
      playForward();
      return;
    }
    reverseRafId.current = requestAnimationFrame(stepReverse);
  };

  const handleEnded = (): void => {
    if (stopped) {
      return;
    }
    cancelReversePlayback(reverseRafId, reverseLastTimestamp);
    video.pause();
    reverseRafId.current = requestAnimationFrame(stepReverse);
  };

  const startFromBeginning = (): void => {
    if (stopped) {
      return;
    }
    cancelReversePlayback(reverseRafId, reverseLastTimestamp);
    video.currentTime = 0;
    playForward();
  };

  const stop = (): void => {
    stopped = true;
    cancelReversePlayback(reverseRafId, reverseLastTimestamp);
    video.removeEventListener("ended", handleEnded);
    video.pause();
  };

  video.addEventListener("ended", handleEnded);

  return { startFromBeginning, stop };
}
