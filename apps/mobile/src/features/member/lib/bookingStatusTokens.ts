import { colors } from "../../../theme/tokens";

export type BookingStatusTone = "upcoming" | "completed" | "cancelled" | "missed" | "neutral";

export function resolveBookingStatusTone(
  status: string,
  isUpcoming: boolean,
): BookingStatusTone {
  if (status === "BOOKED" && isUpcoming) {
    return "upcoming";
  }
  if (status === "COMPLETED") {
    return "completed";
  }
  if (status === "CANCELLED") {
    return "cancelled";
  }
  if (status === "MISSED" || status === "NO_SHOW") {
    return "missed";
  }
  return "neutral";
}

type StatusPalette = { bg: string; border: string; text: string };

export function bookingStatusPalette(tone: BookingStatusTone): StatusPalette {
  switch (tone) {
    case "upcoming":
      return { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" };
    case "completed":
      return { bg: "#eff6ff", border: "#bfdbfe", text: "#1e3a8a" };
    case "cancelled":
      return { bg: "#faf9f7", border: "#d6d3d1", text: colors.secondarySage };
    case "missed":
      return { bg: "#fffbeb", border: "#fde68a", text: "#92400e" };
    default:
      return {
        bg: colors.badgeCream,
        border: colors.glassBorder,
        text: colors.primaryGreen80,
      };
  }
}
