"use client";

import { Analytics } from "@vercel/analytics/next";
import {
  shouldSendVercelAnalyticsEvent,
  VERCEL_ANALYTICS_ENABLED,
} from "@/components/analytics/vercel-analytics-config";

export function VercelAnalytics() {
  if (!VERCEL_ANALYTICS_ENABLED) {
    return null;
  }

  return (
    <Analytics
      beforeSend={(event) =>
        shouldSendVercelAnalyticsEvent(event.url) ? event : null
      }
    />
  );
}
