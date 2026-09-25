export const EHDM_STATE_ID = 'default';

export const EHDM_API_PATH = {
  CHECK_CONNECTION: '/checkConnection',
  ACTIVATE: '/activate',
  CONFIGURE_DEPARTMENTS: '/configureDepartments',
  PRINT: '/print',
  PRINT_RETURN: '/printReturnReceipt',
  PRINT_COPY: '/printCopy',
} as const;

export const EHDM_PRINT_MODE = {
  SALE_WITH_ITEMS: 2,
  PREPAYMENT: 3,
} as const;

/** Dram discount per unit: `(price − discount) * quantity`. Omit when unused. */
export const EHDM_DISCOUNT_TYPE_UNIT_PRICE = 2;

export const EHDM_GOOD_NAME_MAX_LENGTH = 30;

export const EHDM_GOOD_CODE_MAX_LENGTH = 32;

export const EHDM_DEFAULT_ITEM_NAME = 'Վճարում';

export const EHDM_DEFAULT_API_URL =
  'https://ecrm.taxservice.am/taxsystem-rs-vcr/api/v1.0';

/** First seq when `EhdmState` row does not exist yet. */
export const EHDM_DEFAULT_INITIAL_SEQ = 1;

/** Tax regime: 1 = with VAT (ԱԱՀ-ով). Confirm with accountant before changing. */
export const EHDM_DEFAULT_DEP = 1;

/** Official PEC example ADG for services. Required on /print; not chosen per sale. */
export const EHDM_DEFAULT_ADG_CODE = '9205';

export const EHDM_DEFAULT_UNIT = 'Հատ';

export const EHDM_DEFAULT_CASHIER_ID = 1;

export const EHDM_RECEIPT_MAX_ATTEMPTS = 3;

export const EHDM_RECEIPT_RETRY_DELAY_MS = 2000;

export const EHDM_RETURN_PRODUCT_ID = 0;
