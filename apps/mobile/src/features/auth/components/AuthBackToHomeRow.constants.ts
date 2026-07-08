import { CIRCULAR_BACK_BUTTON_SIZE } from "../../../components/navigation/CircularBackButton";
import { space } from "../../../theme/tokens";

/** Core row: top gap + hit target + gap before form (matches previous layout). */
const AUTH_BACK_TO_HOME_ROW_BASE =
  space.xs + CIRCULAR_BACK_BUTTON_SIZE + space.md;

/** Lower the control ~30% vs the base row block (login + register). */
const AUTH_BACK_TOP_NUDGE_FRACTION = 0.3;
export const AUTH_BACK_TOP_NUDGE_DOWN = Math.round(
  AUTH_BACK_TO_HOME_ROW_BASE * AUTH_BACK_TOP_NUDGE_FRACTION,
);

/** Vertical space from safe-area top to first line of scroll content when using `topLeading` in `AuthScreenShell`. */
export const AUTH_BACK_TO_HOME_TOP_RESERVE =
  AUTH_BACK_TO_HOME_ROW_BASE + AUTH_BACK_TOP_NUDGE_DOWN;
