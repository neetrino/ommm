# Promo codes

Staff with backoffice write access create coupons in Admin or Manager → Coupons. Hard delete is limited to an unused draft and to Admin.

Checkout accepts one code on package subscribe, drop-in, gift purchase, and the studio cart. The server validates the code again when the payment is created.

Order of money: original subtotal, coupon discount, gift credit, amount due. A fixed coupon that is larger than the subtotal discounts the purchase to zero. The unused AMD is added to that user's gift-credit wallet only after the payment succeeds. Percentage coupons have no remainder.

A reserved use counts toward the limits while checkout is pending. Retrying the same unpaid checkout replaces the previous bankless attempt, so the user's own reservation does not block the code. Abandoned card checkouts that never reached the bank, including ones that never chose a payment method, are released by orphan cleanup. A succeeded package purchase that used a coupon cannot be refunded or marked failed, and a succeeded use is not restored.

Payment metadata keeps a snapshot (`coupon`) so later edits do not change old payments. Admin → Analytics → Coupons lists every counted use — a pending reservation and a completed payment — with the client, the coupon code, and what was bought. It can be filtered by date, coupon, type, status, creator, and user.
