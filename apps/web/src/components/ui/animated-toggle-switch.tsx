type AnimatedToggleSwitchProps = {
  checked: boolean;
  className?: string;
};

/** Pill toggle with sliding knob and track color transition. */
export function AnimatedToggleSwitch({ checked, className = "" }: AnimatedToggleSwitchProps) {
  const mergedClassName = [
    "ommm-toggle-switch",
    checked ? "ommm-toggle-switch-on" : "ommm-toggle-switch-off",
    className,
  ]
    .filter((value) => value.length > 0)
    .join(" ");

  return (
    <span aria-hidden className={mergedClassName}>
      <span className="ommm-toggle-switch-track">
        <span className="ommm-toggle-switch-knob" />
      </span>
    </span>
  );
}
