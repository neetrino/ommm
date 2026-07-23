import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { optionLabelClassName } from "@/components/ui/dropdown-select.helpers";
import type { DropdownOption } from "@/components/ui/dropdown-select.types";

type DefaultOptionContentProps<T extends string> = {
  option: DropdownOption<T>;
  selected: boolean;
  wrapLabel?: boolean;
};

export function DefaultOptionContent<T extends string>({
  option,
  selected,
  wrapLabel = false,
}: DefaultOptionContentProps<T>) {
  return (
    <>
      <span
        className="ommm-dropdown-checkbox"
        data-checked={selected ? "true" : "false"}
        aria-hidden
      >
        {selected ? <DropdownCheckGlyph className="h-3 w-3" /> : null}
      </span>
      <span className={optionLabelClassName(wrapLabel)}>{option.label}</span>
    </>
  );
}
