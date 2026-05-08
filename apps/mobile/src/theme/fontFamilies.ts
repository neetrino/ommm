/**
 * Font family names must match keys passed to `useFonts` in `app/_layout.tsx`.
 */
export const fontFamilies = {
  newsreader: {
    regular: "Newsreader_400Regular",
    regularItalic: "Newsreader_400Regular_Italic",
    lightItalic: "Newsreader_300Light_Italic",
    mediumItalic: "Newsreader_500Medium_Italic",
    semiBold: "Newsreader_600SemiBold",
    semiBoldItalic: "Newsreader_600SemiBold_Italic",
  },
  manrope: {
    regular: "Manrope_400Regular",
    semiBold: "Manrope_600SemiBold",
    bold: "Manrope_700Bold",
  },
  montserrat: {
    light: "Montserrat_300Light",
    regular: "Montserrat_400Regular",
    bold: "Montserrat_700Bold",
  },
} as const;
