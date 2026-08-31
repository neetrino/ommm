export type WhatsappTopic =
  | 'bookingReminders'
  | 'waitlistAlerts'
  | 'promotions'
  | 'operational';

export type WhatsappSendResult = 'sent' | 'skipped' | 'failed';

export type WhatsappPreferenceRow = {
  whatsappEnabled: boolean;
  bookingReminders: boolean;
  waitlistAlerts: boolean;
  promotions: boolean;
};

export function resolveWhatsappPrefs(
  row: WhatsappPreferenceRow | null | undefined,
): WhatsappPreferenceRow {
  return {
    whatsappEnabled: row?.whatsappEnabled ?? true,
    bookingReminders: row?.bookingReminders ?? true,
    waitlistAlerts: row?.waitlistAlerts ?? true,
    promotions: row?.promotions ?? false,
  };
}

export function allowsWhatsappTopic(
  prefs: WhatsappPreferenceRow,
  topic: WhatsappTopic,
): boolean {
  if (!prefs.whatsappEnabled) {
    return false;
  }
  if (topic === 'operational') {
    return true;
  }
  if (topic === 'bookingReminders') {
    return prefs.bookingReminders;
  }
  if (topic === 'waitlistAlerts') {
    return prefs.waitlistAlerts;
  }
  return prefs.promotions;
}
