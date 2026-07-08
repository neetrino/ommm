import type { AppUiLocale } from "./locales";

import en from "../../../web/src/messages/en.json";
import hy from "../../../web/src/messages/hy.json";
import ru from "../../../web/src/messages/ru.json";

export type MessageTree = Record<string, unknown>;

export const messagesByLocale: Readonly<Record<AppUiLocale, MessageTree>> = {
  en: en as MessageTree,
  hy: hy as MessageTree,
  ru: ru as MessageTree,
};

export function messagesForLocale(locale: AppUiLocale): MessageTree {
  return messagesByLocale[locale];
}
