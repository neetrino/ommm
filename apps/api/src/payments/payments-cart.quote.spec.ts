import { quoteStudioCart } from './payments-cart.quote';

describe('quoteStudioCart', () => {
  it('covers the class with a class card and applies money gift to the rest', () => {
    const quote = quoteStudioCart({
      packageCents: 40000,
      sessionCents: 15000,
      barCents: 2000,
      classSessionsAvailable: 1,
      spendableGiftCents: 10000,
      useGiftCredits: true,
      hasSession: true,
    });
    expect(quote.classSessionsCovered).toBe(1);
    expect(quote.sessionChargeCents).toBe(0);
    expect(quote.moneyTotalCents).toBe(42000);
    expect(quote.appliedGiftCents).toBe(10000);
    expect(quote.chargeCents).toBe(32000);
  });

  it('charges the session when no class credit is available', () => {
    const quote = quoteStudioCart({
      packageCents: 0,
      sessionCents: 15000,
      barCents: 2000,
      classSessionsAvailable: 0,
      spendableGiftCents: 20000,
      useGiftCredits: true,
      hasSession: true,
    });
    expect(quote.classSessionsCovered).toBe(0);
    expect(quote.chargeCents).toBe(0);
    expect(quote.appliedGiftCents).toBe(17000);
  });
});
