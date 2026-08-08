"use client";

import { LandingRocketFlight } from "@/components/LandingRocketFlight";
import { usePathname } from "@/i18n/navigation";

const ROCKET_FLIGHT_MARKETING_PATHS = new Set([
  "/story",
  "/schedule",
  "/package",
  "/packages",
  "/contact",
]);

export function MarketingRocketFlightGate() {
  const pathname = usePathname();

  if (!ROCKET_FLIGHT_MARKETING_PATHS.has(pathname)) {
    return null;
  }

  return <LandingRocketFlight />;
}
