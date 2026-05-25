import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type DropletId = "glow" | "cream" | "peach" | "brand";

type DropletConfig = {
  id: DropletId;
  xPercent: number;
  yPercent: number;
  size: number;
  className: string;
  draggable: boolean;
  wobbleStrength: number;
  pushRadius: number;
  zIndex: number;
  hitPadding: number;
};

type DropletState = {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  targetX: number;
  targetY: number;
  impulseX: number;
  impulseY: number;
};

const DROPLETS: readonly DropletConfig[] = [
  {
    id: "glow",
    xPercent: 78,
    yPercent: 50,
    size: 288,
    className: "bg-cream-50/40 blur-3xl",
    draggable: false,
    wobbleStrength: 0.016,
    pushRadius: 220,
    zIndex: 1,
    hitPadding: 0,
  },
  {
    id: "cream",
    xPercent: 66,
    yPercent: 26,
    size: 176,
    className: "bg-cream-50/50",
    draggable: true,
    wobbleStrength: 0.025,
    pushRadius: 160,
    zIndex: 2,
    hitPadding: 16,
  },
  {
    id: "peach",
    xPercent: 52,
    yPercent: 78,
    size: 112,
    className: "bg-peach-100/60",
    draggable: true,
    wobbleStrength: 0.03,
    pushRadius: 140,
    zIndex: 3,
    hitPadding: 16,
  },
  {
    id: "brand",
    xPercent: 72,
    yPercent: 50,
    size: 128,
    className: "ring-4 ring-white/50",
    draggable: true,
    wobbleStrength: 0.02,
    pushRadius: 170,
    zIndex: 4,
    hitPadding: 18,
  },
] as const;

export function GiftCardDroplets() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<DropletId, HTMLDivElement | null>>({
    glow: null,
    cream: null,
    peach: null,
    brand: null,
  });
  const statesRef = useRef<Record<DropletId, DropletState>>({
    glow: {
      x: 0,
      y: 0,
      anchorX: 0,
      anchorY: 0,
      targetX: 0,
      targetY: 0,
      impulseX: 0,
      impulseY: 0,
    },
    cream: {
      x: 0,
      y: 0,
      anchorX: 0,
      anchorY: 0,
      targetX: 0,
      targetY: 0,
      impulseX: 0,
      impulseY: 0,
    },
    peach: {
      x: 0,
      y: 0,
      anchorX: 0,
      anchorY: 0,
      targetX: 0,
      targetY: 0,
      impulseX: 0,
      impulseY: 0,
    },
    brand: {
      x: 0,
      y: 0,
      anchorX: 0,
      anchorY: 0,
      targetX: 0,
      targetY: 0,
      impulseX: 0,
      impulseY: 0,
    },
  });
  const dragRef = useRef<{
    id: DropletId;
    pointerOffsetX: number;
    pointerOffsetY: number;
    pointerId: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const phases = useMemo(
    () => ({
      glow: 0.3,
      cream: 1.4,
      peach: 2.8,
      brand: 4.2,
    }),
    [],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  const pushDroplets = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      for (const droplet of DROPLETS) {
        if (dragRef.current?.id === droplet.id) {
          continue;
        }

        const state = statesRef.current[droplet.id];
        const centerX = (droplet.xPercent / 100) * rect.width + state.x;
        const centerY = (droplet.yPercent / 100) * rect.height + state.y;
        const dx = centerX - localX;
        const dy = centerY - localY;
        const dist = Math.hypot(dx, dy);

        if (dist <= 0.01 || dist > droplet.pushRadius) {
          continue;
        }

        const force = (1 - dist / droplet.pushRadius) * 8;
        const unitX = dx / dist;
        const unitY = dy / dist;
        state.impulseX += unitX * force;
        state.impulseY += unitY * force;
      }
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const activeDrag = dragRef.current;
      const container = containerRef.current;

      if (activeDrag && container) {
        const rect = container.getBoundingClientRect();
        const droplet = DROPLETS.find((item) => item.id === activeDrag.id);
        if (!droplet) {
          return;
        }

        const localX = event.clientX - rect.left - activeDrag.pointerOffsetX;
        const localY = event.clientY - rect.top - activeDrag.pointerOffsetY;
        const baseX = (droplet.xPercent / 100) * rect.width;
        const baseY = (droplet.yPercent / 100) * rect.height;

        const state = statesRef.current[droplet.id];
        state.anchorX = localX - baseX;
        state.anchorY = localY - baseY;
        state.targetX = state.anchorX;
        state.targetY = state.anchorY;
        return;
      }

      if (!prefersReducedMotion) {
        pushDroplets(event.clientX, event.clientY);
      }
    },
    [prefersReducedMotion, pushDroplets],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>, droplet: DropletConfig) => {
      if (prefersReducedMotion || !droplet.draggable) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const centerX = (droplet.xPercent / 100) * rect.width;
      const centerY = (droplet.yPercent / 100) * rect.height;
      const state = statesRef.current[droplet.id];
      const displayX = centerX + state.x;
      const displayY = centerY + state.y;
      const hitRadius = droplet.size * 0.5 + droplet.hitPadding;
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const distance = Math.hypot(localX - displayX, localY - displayY);

      if (distance > hitRadius) {
        return;
      }

      dragRef.current = {
        id: droplet.id,
        pointerOffsetX: localX - displayX,
        pointerOffsetY: localY - displayY,
        pointerId: event.pointerId,
      };
      container.setPointerCapture(event.pointerId);
      event.currentTarget.style.cursor = "grabbing";
    },
    [prefersReducedMotion],
  );

  const releaseDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const activeDrag = dragRef.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
      return;
    }

    const container = containerRef.current;
    const item = itemRefs.current[activeDrag.id];
    if (item) {
      item.style.cursor = "grab";
    }
    if (container?.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      for (const droplet of DROPLETS) {
        const item = itemRefs.current[droplet.id];
        const state = statesRef.current[droplet.id];
        state.x = 0;
        state.y = 0;
        state.anchorX = 0;
        state.anchorY = 0;
        state.targetX = 0;
        state.targetY = 0;
        state.impulseX = 0;
        state.impulseY = 0;

        if (item) {
          item.style.transform = "translate3d(0px, 0px, 0px) scale(1)";
        }
      }
      return;
    }

    const start = performance.now();
    const animate = (now: number) => {
      const time = (now - start) / 1000;

      for (const droplet of DROPLETS) {
        const state = statesRef.current[droplet.id];
        const phase = phases[droplet.id];
        const driftX = Math.sin(time * 0.42 + phase) * (droplet.size * 0.035);
        const driftY = Math.cos(time * 0.36 + phase * 1.4) * (droplet.size * 0.028);
        const dragActive = dragRef.current?.id === droplet.id;

        if (!dragActive) {
          state.targetX = state.anchorX + driftX;
          state.targetY = state.anchorY + driftY;
        }

        state.impulseX *= 0.92;
        state.impulseY *= 0.92;
        state.targetX += state.impulseX;
        state.targetY += state.impulseY;
        state.x += (state.targetX - state.x) * 0.11;
        state.y += (state.targetY - state.y) * 0.11;

        const wobble = Math.sin(time * 0.9 + phase) * droplet.wobbleStrength;
        const scaleX = 1 + wobble;
        const scaleY = 1 - wobble * 0.85;
        const item = itemRefs.current[droplet.id];

        if (item) {
          item.style.transform =
            `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) ` +
            `scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
        }
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [phases, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-none"
      onPointerMove={handlePointerMove}
      onPointerLeave={releaseDrag}
      onPointerUp={releaseDrag}
      onPointerCancel={releaseDrag}
    >
      {DROPLETS.map((droplet) => (
        <div
          key={droplet.id}
          ref={(node) => {
            itemRefs.current[droplet.id] = node;
          }}
          className={`absolute rounded-full will-change-transform ${droplet.className}`}
          style={{
            left: `${droplet.xPercent}%`,
            top: `${droplet.yPercent}%`,
            width: `${droplet.size}px`,
            height: `${droplet.size}px`,
            marginLeft: `${droplet.size / -2}px`,
            marginTop: `${droplet.size / -2}px`,
            zIndex: droplet.zIndex,
            pointerEvents: droplet.draggable ? "auto" : "none",
            cursor: droplet.draggable ? "grab" : "default",
          }}
          onPointerDown={(event) => handlePointerDown(event, droplet)}
        >
          {droplet.id === "brand" ? (
            <span className="inline-flex h-full w-full select-none items-center justify-center overflow-hidden rounded-full">
              <Image
                src="/marketing/home/brand-mark.png"
                alt=""
                width={128}
                height={128}
                className="h-full w-full object-cover"
                draggable={false}
                {...belowFoldImageProps()}
              />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
