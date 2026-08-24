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

export const EHDM_GOOD_NAME_MAX_LENGTH = 30;

export const EHDM_DEFAULT_API_URL =
  'https://ecrm.taxservice.am/taxsystem-rs-vcr/api/v1.0';

/** First seq when `EhdmState` row does not exist yet. */
export const EHDM_DEFAULT_INITIAL_SEQ = 1;

/** Tax regime: 1 = with VAT (ԱԱՀ-ով). Confirm with accountant before changing. */
export const EHDM_DEFAULT_DEP = 1;

/** Default ADG code for studio/service sales — override via ENV if accountant specifies. */
export const EHDM_DEFAULT_ADG_CODE = '9205';

export const EHDM_DEFAULT_UNIT = 'Հատ';

export const EHDM_DEFAULT_CASHIER_ID = 1;

/** Placeholder CRN/TIN for mock receipts until live credentials are configured. */
export const EHDM_MOCK_CRN = '00000000';

export const EHDM_MOCK_TIN = '00000000';
