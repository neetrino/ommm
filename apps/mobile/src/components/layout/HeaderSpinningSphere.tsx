import { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";

/** Same ping-pong MP4 as web hero — `home-hero-logo-mark.mp4`. */
const HEADER_LOGO_MARK_VIDEO = require("../../../assets/videos/home-hero-logo-mark.mp4");
/** Static fallback when reduce-motion is on or video cannot play. */
const HEADER_LOGO_MARK_STILL = require("../../../assets/images/home-hero-logo-mark.webp");

/**
 * Matches web `HOME_HERO_LOGO_MARK_VIDEO_EDGE_CROP_SCALE` — H.264 leaves a black
 * matte around the sphere; scale past the clip so only the ball is visible.
 */
const VIDEO_EDGE_CROP_SCALE = 1.22;

type HeaderSpinningSphereProps = {
  size: number;
};

/**
 * Header brand sphere — plays the same looping ping-pong video as the web hero mark.
 */
export function HeaderSpinningSphere({ size }: HeaderSpinningSphereProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) {
        setReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  if (reduceMotion) {
    return (
      <View
        style={[styles.clip, { width: size, height: size, borderRadius: size / 2 }]}
        accessibilityLabel="Ommm"
        accessibilityRole="image"
      >
        <Image
          source={HEADER_LOGO_MARK_STILL}
          style={[
            styles.mediaCropped,
            {
              width: size * VIDEO_EDGE_CROP_SCALE,
              height: size * VIDEO_EDGE_CROP_SCALE,
            },
          ]}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return <HeaderSpinningSphereVideo size={size} />;
}

function HeaderSpinningSphereVideo({ size }: HeaderSpinningSphereProps) {
  const player = useVideoPlayer(HEADER_LOGO_MARK_VIDEO, (instance) => {
    instance.loop = true;
    instance.muted = true;
    playerPlaySafe(instance);
  });

  useEffect(() => {
    playerPlaySafe(player);
    return () => {
      player.pause();
    };
  }, [player]);

  const mediaSize = size * VIDEO_EDGE_CROP_SCALE;

  return (
    <View
      style={[styles.clip, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityLabel="Ommm"
      accessibilityRole="image"
    >
      <VideoView
        player={player}
        style={[styles.mediaCropped, { width: mediaSize, height: mediaSize }]}
        contentFit="cover"
        nativeControls={false}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

function playerPlaySafe(player: { play: () => void }): void {
  try {
    player.play();
  } catch {
    /* Autoplay may be deferred until the view mounts. */
  }
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaCropped: {
    // Centered inside the circular clip; scale crops the black H.264 matte.
  },
});
