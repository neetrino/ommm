const CHOICE_CLASS =
  "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50";
const CHOICE_IDLE_CLASS = "border-sand-500/40 bg-white text-sage-800 hover:border-sage-500/40";
const CHOICE_SELECTED_CLASS = "border-sage-700 bg-sage-800 text-white";

type GiftAmountChoice = {
  amountAmd: number;
  label: string;
};

type GiftAmountChoicesProps = {
  choices: readonly GiftAmountChoice[];
  selectedAmd: number | null;
  disabled: boolean;
  onSelect: (amountAmd: number) => void;
};

/** Ready-made gift amounts. The free amount field stays beside these. */
export function GiftAmountChoices({
  choices,
  selectedAmd,
  disabled,
  onSelect,
}: GiftAmountChoicesProps) {
  if (choices.length === 0) {
    return null;
  }
  return (
    <div className="relative z-10 mt-4 flex flex-wrap gap-2">
      {choices.map((choice) => (
        <button
          key={choice.amountAmd}
          type="button"
          disabled={disabled}
          className={`${CHOICE_CLASS} ${
            selectedAmd === choice.amountAmd ? CHOICE_SELECTED_CLASS : CHOICE_IDLE_CLASS
          }`}
          onClick={() => onSelect(choice.amountAmd)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
