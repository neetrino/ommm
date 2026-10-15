import type { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import type { ExportLocale } from '../common/xlsx/export-locale';
import type { PaymentListSource } from './payments.types';

export type PaymentsExportCopy = {
  title: string;
  allTime: string;
  count: (count: number) => string;
  total: string;
  date: string;
  time: string;
  client: string;
  email: string;
  phone: string;
  amount: string;
  status: string;
  method: string;
  source: string;
  item: string;
  description: string;
  reference: string;
  sessionsCount: (count: string) => string;
  sessionsUnlimited: string;
  statuses: Record<PaymentStatus, string>;
  methods: Record<ManualPaymentMethod, string>;
  sources: Record<PaymentListSource, string>;
};

export const PAYMENTS_EXPORT_COPY: Record<ExportLocale, PaymentsExportCopy> = {
  en: {
    title: 'Payments',
    allTime: 'All time',
    count: (count) => `${count} payments`,
    total: 'Total',
    date: 'Date',
    time: 'Time',
    client: 'Client',
    email: 'Email',
    phone: 'Phone',
    amount: 'Amount (AMD)',
    status: 'Status',
    method: 'Payment method',
    source: 'Source',
    item: 'Item',
    description: 'Description',
    reference: 'Reference',
    sessionsCount: (count) => `${count} sessions`,
    sessionsUnlimited: 'Unlimited',
    statuses: {
      PENDING: 'Pending',
      SUCCEEDED: 'Succeeded',
      FAILED: 'Failed',
      REFUNDED: 'Refunded',
    },
    methods: {
      CASH: 'Cash',
      CARD: 'Card (online)',
      CARD_TERMINAL: 'Card terminal',
      BANK_TRANSFER: 'Bank transfer',
      OTHER: 'Other',
      INFLUENCER: 'Influencer',
    },
    sources: {
      package: 'Package',
      dropin: 'Drop-in',
      gift: 'Gift',
      other: 'Other',
    },
  },
  hy: {
    title: 'Վճարումներ',
    allTime: 'Ամբողջ ժամանակահատված',
    count: (count) => `${count} վճարում`,
    total: 'Ընդամենը',
    date: 'Ամսաթիվ',
    time: 'Ժամ',
    client: 'Հաճախորդ',
    email: 'Էլ. փոստ',
    phone: 'Հեռախոս',
    amount: 'Գումար (AMD)',
    status: 'Կարգավիճակ',
    method: 'Վճարման եղանակ',
    source: 'Աղբյուր',
    item: 'Ապրանք',
    description: 'Նկարագրություն',
    reference: 'Հղում',
    sessionsCount: (count) => `${count} նիստ`,
    sessionsUnlimited: 'Անսահմանափակ',
    statuses: {
      PENDING: 'Սպասման մեջ',
      SUCCEEDED: 'Հաջողված',
      FAILED: 'Ձախողված',
      REFUNDED: 'Վերադարձված',
    },
    methods: {
      CASH: 'Կանխիկ',
      CARD: 'Քարտ (առցանց)',
      CARD_TERMINAL: 'Քարտային տերմինալ',
      BANK_TRANSFER: 'Բանկային փոխանցում',
      OTHER: 'Այլ',
      INFLUENCER: 'Ինֆլուենսեր',
    },
    sources: {
      package: 'Փաթեթ',
      dropin: 'Մեկանգամյա',
      gift: 'Նվեր',
      other: 'Այլ',
    },
  },
  ru: {
    title: 'Платежи',
    allTime: 'За всё время',
    count: (count) => `Платежей: ${count}`,
    total: 'Итого',
    date: 'Дата',
    time: 'Время',
    client: 'Клиент',
    email: 'Email',
    phone: 'Телефон',
    amount: 'Сумма (AMD)',
    status: 'Статус',
    method: 'Способ оплаты',
    source: 'Источник',
    item: 'Позиция',
    description: 'Описание',
    reference: 'Референс',
    sessionsCount: (count) => `${count} сеансов`,
    sessionsUnlimited: 'Безлимит',
    statuses: {
      PENDING: 'В ожидании',
      SUCCEEDED: 'Успешно',
      FAILED: 'Ошибка',
      REFUNDED: 'Возврат',
    },
    methods: {
      CASH: 'Наличные',
      CARD: 'Карта (онлайн)',
      CARD_TERMINAL: 'Терминал',
      BANK_TRANSFER: 'Банковский перевод',
      OTHER: 'Другое',
      INFLUENCER: 'Инфлюенсер',
    },
    sources: {
      package: 'Пакет',
      dropin: 'Разовое',
      gift: 'Подарок',
      other: 'Другое',
    },
  },
};
