export type HomePlanCardCopy = {
  id: string;
  planName: string;
  details: string;
  priceAmount: string;
  /** When set, "From" (or locale equivalent) renders on line 2 and `priceAmount` on line 3. */
  priceFromPrefix?: string;
  ctaAria: string;
  isPopular: boolean;
};
