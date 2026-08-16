import { Matches } from 'class-validator';

export const CALL_TASK_DUE_ON_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const CALL_TASK_DUE_ON_MESSAGE = 'dueOn must be YYYY-MM-DD';

export const CallTaskDueOnMatches = Matches(CALL_TASK_DUE_ON_PATTERN, {
  message: CALL_TASK_DUE_ON_MESSAGE,
});

