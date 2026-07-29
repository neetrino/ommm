"use client";

import {
  Children,
  isValidElement,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type AdminRowIconButtonVariant = "default" | "danger" | "subtle" | "warning";

export type AdminRowIconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  ariaLabel: string;
  title?: string;
  variant?: AdminRowIconButtonVariant;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<AdminRowIconButtonVariant, string> = {
  default: "",
  danger: "ommm-admin-row-icon-button-danger",
  subtle: "ommm-admin-row-icon-button-subtle",
  warning: "ommm-admin-row-icon-button-warning",
};

const ICON_BUTTON_SIZE_PX = 28;
const ICON_BUTTON_LG_SIZE_PX = 40;
const ICON_ORBIT_GAP_PX = 4;
const ICON_ORBIT_LG_GAP_PX = 5;
const CIRCLE_PADDING_PX = 4;

type AdminRowIconGroupSize = "default" | "lg";

function sizeConfig(size: AdminRowIconGroupSize): {
  buttonPx: number;
  gapPx: number;
  paddingPx: number;
} {
  if (size === "lg") {
    return {
      buttonPx: ICON_BUTTON_LG_SIZE_PX,
      gapPx: ICON_ORBIT_LG_GAP_PX,
      paddingPx: CIRCLE_PADDING_PX,
    };
  }
  return {
    buttonPx: ICON_BUTTON_SIZE_PX,
    gapPx: ICON_ORBIT_GAP_PX,
    paddingPx: CIRCLE_PADDING_PX,
  };
}

/** Minimum orbit radius so circular buttons do not overlap. */
function orbitRadiusPx(itemCount: number, size: AdminRowIconGroupSize): number {
  if (itemCount <= 1) {
    return 0;
  }
  const { buttonPx, gapPx } = sizeConfig(size);
  const angleStepRad = Math.PI / itemCount;
  const minRadius = (buttonPx + gapPx) / (2 * Math.sin(angleStepRad));
  return Math.ceil(minRadius);
}

function circleContainerSizePx(itemCount: number, size: AdminRowIconGroupSize): number {
  const { buttonPx, paddingPx } = sizeConfig(size);
  const radius = orbitRadiusPx(itemCount, size);
  return radius * 2 + buttonPx + paddingPx * 2;
}

/** Compact circular icon control for admin table/card row actions. */
export function AdminRowIconButton({
  ariaLabel,
  title,
  variant = "default",
  className = "",
  disabled = false,
  children,
  ...rest
}: AdminRowIconButtonProps) {
  const mergedClassName = [
    "ommm-admin-row-icon-button",
    VARIANT_CLASSES[variant],
    className,
  ]
    .filter((value) => value.length > 0)
    .join(" ");

  return (
    <button
      type="button"
      className={mergedClassName}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Arranges row action icons evenly on a circular orbit. */
export function AdminRowIconGroup({
  children,
  size = "default",
}: {
  children: ReactNode;
  size?: AdminRowIconGroupSize;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  const count = items.length;

  if (count === 0) {
    return null;
  }

  const radius = orbitRadiusPx(count, size);
  const containerSize = circleContainerSizePx(count, size);

  return (
    <div
      className="ommm-admin-row-icon-circle"
      style={{ width: containerSize, height: containerSize }}
      role="group"
    >
      {items.map((child, index) => {
        const angleDeg = (360 / count) * index - 90;
        const orbitStyle = {
          "--orbit-angle": `${angleDeg}deg`,
          "--orbit-radius": `${radius}px`,
        } as CSSProperties;

        return (
          <div
            key={index}
            className="ommm-admin-row-icon-circle-item"
            style={orbitStyle}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
