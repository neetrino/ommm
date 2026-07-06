/**
 * Font family names must match keys passed to `useFonts` in `app/_layout.tsx`.
 */
export const fontFamilies = {
  gtSuperDs: {
    light: "GTSuperDsTrial_Light",
    regular: "GTSuperDsTrial_Regular",
    medium: "GTSuperDsTrial_Medium",
    bold: "GTSuperDsTrial_Bold",
    lightItalic: "GTSuperDsTrial_LightItalic",
    regularItalic: "GTSuperDsTrial_RegularItalic",
    mediumItalic: "GTSuperDsTrial_MediumItalic",
    boldItalic: "GTSuperDsTrial_BoldItalic",
  },
  manrope: {
    regular: "Manrope_400Regular",
    semiBold: "Manrope_600SemiBold",
    bold: "Manrope_700Bold",
  },
} as const;
