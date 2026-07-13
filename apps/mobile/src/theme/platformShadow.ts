import { Platform, type TextStyle, type ViewStyle } from "react-native";

type RgbaColor = {
  r: number;
  g: number;
  b: number;
};

function parseHexColor(color: string): RgbaColor | null {
  const hex = color.trim();
  const short = /^#([0-9a-fA-F]{3})$/.exec(hex);
  if (short) {
    const [r, g, b] = short[1].split("");
    return {
      r: Number.parseInt(`${r}${r}`, 16),
      g: Number.parseInt(`${g}${g}`, 16),
      b: Number.parseInt(`${b}${b}`, 16),
    };
  }
  const full = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (full) {
    return {
      r: Number.parseInt(full[1].slice(0, 2), 16),
      g: Number.parseInt(full[1].slice(2, 4), 16),
      b: Number.parseInt(full[1].slice(4, 6), 16),
    };
  }
  const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(hex);
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
    };
  }
  return null;
}

function toRgba(color: string, opacity: number): string {
  const parsed = parseHexColor(color);
  if (parsed === null) {
    return color;
  }
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${opacity})`;
}

export type PlatformShadowInput = {
  color: string;
  offsetWidth?: number;
  offsetHeight: number;
  opacity: number;
  radius: number;
  /** Android elevation; ignored on web/iOS when shadow props are used. */
  elevation?: number;
};

/**
 * Cross-platform shadow: `boxShadow` on web, legacy shadow* on iOS,
 * elevation on Android when provided.
 */
export function platformShadow(input: PlatformShadowInput): ViewStyle {
  const offsetWidth = input.offsetWidth ?? 0;
  if (Platform.OS === "web") {
    return {
      // RN Web deprecates shadow*; boxShadow is the supported CSS path.
      boxShadow: `${offsetWidth}px ${input.offsetHeight}px ${input.radius}px ${toRgba(input.color, input.opacity)}`,
    } as ViewStyle;
  }
  if (Platform.OS === "android") {
    return {
      elevation: input.elevation ?? Math.max(1, Math.round(input.radius / 4)),
    };
  }
  return {
    shadowColor: input.color,
    shadowOffset: { width: offsetWidth, height: input.offsetHeight },
    shadowOpacity: input.opacity,
    shadowRadius: input.radius,
  };
}

export type PlatformTextShadowInput = {
  color: string;
  offsetWidth?: number;
  offsetHeight: number;
  radius: number;
};

/** Cross-platform text shadow: `textShadow` on web, legacy textShadow* on native. */
export function platformTextShadow(input: PlatformTextShadowInput): TextStyle {
  const offsetWidth = input.offsetWidth ?? 0;
  if (Platform.OS === "web") {
    return {
      textShadow: `${offsetWidth}px ${input.offsetHeight}px ${input.radius}px ${input.color}`,
    } as TextStyle;
  }
  return {
    textShadowColor: input.color,
    textShadowOffset: { width: offsetWidth, height: input.offsetHeight },
    textShadowRadius: input.radius,
  };
}
