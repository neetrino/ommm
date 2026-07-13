"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  META_PIXEL_ENABLED,
  META_PIXEL_ID,
  shouldSendMetaPixelPageView,
} from "@/components/analytics/meta-pixel-config";
import { usePathname } from "@/i18n/navigation";

const META_PIXEL_SCRIPT_ID = "meta-pixel";

function buildMetaPixelBootstrap(pixelId: string): string {
  return `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
`.trim();
}

export function MetaPixel() {
  const pathname = usePathname();
  const [isScriptReady, setIsScriptReady] = useState(false);
  const trackPageView = shouldSendMetaPixelPageView(pathname);

  useEffect(() => {
    if (!META_PIXEL_ENABLED || !isScriptReady || !trackPageView) {
      return;
    }
    window.fbq?.("track", "PageView");
  }, [isScriptReady, trackPageView]);

  if (!META_PIXEL_ENABLED) {
    return null;
  }

  return (
    <>
      <Script
        id={META_PIXEL_SCRIPT_ID}
        strategy="afterInteractive"
        onLoad={() => {
          setIsScriptReady(true);
        }}
        dangerouslySetInnerHTML={{
          __html: buildMetaPixelBootstrap(META_PIXEL_ID),
        }}
      />
      {trackPageView ? (
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element -- Meta Pixel noscript fallback */}
          <img
            alt=""
            height="1"
            width="1"
            className="hidden"
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
      ) : null}
    </>
  );
}
