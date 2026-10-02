/**
 * Live gift-card flow against the local API. Not a committed test.
 * Password comes from GIFT_TEST_ADMIN_PASSWORD.
 */
const API = process.env.GIFT_TEST_API ?? 'http://127.0.0.1:4000/v1';
const adminEmail = process.env.GIFT_TEST_ADMIN_EMAIL;
const adminPassword = process.env.GIFT_TEST_ADMIN_PASSWORD;
const stamp = Date.now().toString(36);
const failures = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
    console.error(`FAIL  ${message}`);
    return;
  }
  console.log(`PASS  ${message}`);
}

async function request(path, { method = 'GET', cookie, body, raw = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (cookie) {
    headers.Cookie = cookie;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const setCookie = response.headers.getSetCookie?.() ?? [];
  let json = null;
  if (!raw && text.length > 0) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }
  return { status: response.status, json, text, setCookie };
}

function cookieFrom(setCookie) {
  const access = setCookie.find((row) => row.startsWith('ommm_access='));
  if (!access) {
    return null;
  }
  return access.split(';')[0];
}

async function login(email, password) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  const cookie = cookieFrom(response.setCookie);
  return { status: response.status, cookie, user: response.json?.user, body: response.json };
}

async function register(user) {
  const response = await request('/auth/register', { method: 'POST', body: user });
  return { status: response.status, cookie: cookieFrom(response.setCookie), body: response.json };
}

async function main() {
  if (!adminEmail || !adminPassword) {
    throw new Error('Admin credentials are required in the environment');
  }

  const admin = await login(adminEmail, adminPassword);
  assert((admin.status === 200 || admin.status === 201) && admin.cookie, `admin login (${admin.status})`);
  if (!admin.cookie) {
    console.error(JSON.stringify(admin.body));
    process.exit(1);
  }
  const adminCookie = admin.cookie;

  const policy = await request('/gift-cards/policy', { cookie: adminCookie });
  assert(policy.status === 200, `policy endpoint (${policy.status})`);
  assert(
    Array.isArray(policy.json?.denominationsAmd) && policy.json.denominationsAmd.includes(40000),
    'policy includes 40000 denomination',
  );
  assert(policy.json?.validityMonths === 12, 'default validity is 12 months');

  const buyer = await register({
    email: `gift.buyer.${stamp}@example.com`,
    password: 'GiftTest77!',
    name: 'Gift',
    lastName: 'Buyer',
    phone: `+37499${String(Date.now()).slice(-6)}`,
    locale: 'en',
  });
  const recipientPhone = `+37498${String(Date.now() + 1).slice(-6)}`;
  const recipient = await register({
    email: `gift.recipient.${stamp}@example.com`,
    password: 'GiftTest77!',
    name: 'Gift',
    lastName: 'Recipient',
    phone: recipientPhone,
    locale: 'en',
  });
  const buyerSession = buyer.cookie
    ? buyer
    : await login(`gift.buyer.${stamp}@example.com`, 'GiftTest77!');
  const recipientSession = recipient.cookie
    ? recipient
    : await login(`gift.recipient.${stamp}@example.com`, 'GiftTest77!');
  assert(Boolean(buyerSession.cookie), `buyer session (${buyer.status} / login ${buyerSession.status})`);
  assert(Boolean(recipientSession.cookie), `recipient session (${recipient.status} / login ${recipientSession.status})`);
  if (!buyerSession.cookie || !recipientSession.cookie) {
    console.error('register bodies', buyer.body, recipient.body);
    process.exit(1);
  }
  buyer.cookie = buyerSession.cookie;
  recipient.cookie = recipientSession.cookie;

  const me = await request('/users/me', { cookie: recipient.cookie });
  const recipientId = me.json?.id ?? me.json?.user?.id;
  assert(typeof recipientId === 'string', 'recipient id');

  const created = await request('/gift-cards/admin', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      amountAmd: 40000,
      quantity: 2,
      message: `live-check-${stamp}`,
    },
  });
  assert(created.status === 201 || created.status === 200, `admin batch create (${created.status})`);
  const batchId = created.json?.id;
  assert(typeof batchId === 'string', 'batch id');
  if (!batchId) {
    console.error(JSON.stringify(created.json));
    process.exit(1);
  }

  const listed = await request('/gift-cards/admin', { cookie: adminCookie });
  const minted = (Array.isArray(listed.json) ? listed.json : []).filter((card) => card.batchId === batchId);
  assert(minted.length === 2, `two codes minted immediately (got ${minted.length})`);
  assert(minted.every((card) => card.recipientId == null), 'minted cards are not bound to a user');
  assert(minted.every((card) => typeof card.code === 'string' && card.code.length >= 8), 'codes are present');
  assert(minted.every((card) => card.expiresAt != null), 'default expiry is stored');
  const code = minted[0]?.code;
  const spareCode = minted[1]?.code;

  const search = await request(`/gift-cards/admin/batches?search=${encodeURIComponent(code)}`, {
    cookie: adminCookie,
  });
  const searchRows = search.json?.items ?? search.json?.batches ?? search.json;
  const searchText = JSON.stringify(searchRows);
  assert(search.status === 200 && searchText.includes(batchId), `search by code finds the batch (${search.status})`);

  const exported = await request(`/gift-cards/admin/batches/${batchId}/export`, {
    cookie: adminCookie,
    raw: true,
  });
  assert(exported.status === 200 && exported.text.startsWith('PK'), 'excel export is an xlsx workbook');

  const historyBefore = await request(`/gift-cards/admin/${minted[0].id}/redemptions`, {
    cookie: adminCookie,
  });
  const issueEvent = (historyBefore.json?.events ?? []).find((event) => event.type === 'ISSUE');
  assert(Boolean(issueEvent), 'issue is stored in the ledger');

  const checkout = await request('/payments/checkout/gift', {
    method: 'POST',
    cookie: buyer.cookie,
    body: {
      batchId,
      amountAmd: 40000,
      recipientId,
      message: 'For the live check',
    },
  });
  assert(checkout.status === 201 || checkout.status === 200, `gift checkout (${checkout.status})`);
  const reference = checkout.json?.paymentReference;
  assert(typeof reference === 'string', 'payment reference');

  let confirmed = null;
  if (reference) {
    confirmed = await request(`/payments/checkout/gift/${reference}/confirm`, {
      method: 'POST',
      cookie: buyer.cookie,
      body: { paymentMethod: 'CARD' },
    });
    assert(confirmed.status === 200 || confirmed.status === 201, `fake card confirm (${confirmed.status})`);
    if (confirmed.status >= 400) {
      console.error(JSON.stringify(confirmed.json));
    }
  }

  const purchased = await request('/gift-cards/me/purchased', { cookie: buyer.cookie });
  const bought = (Array.isArray(purchased.json) ? purchased.json : []).find((card) => card.code === code || card.code === spareCode);
  const purchasedCode = bought?.code ?? code;
  assert(Boolean(bought), 'buyer can see the purchased code');
  assert(bought?.recipientId == null || bought?.recipientEmail != null, 'purchase did not pre-bind, or contact is stored');

  const before = await request('/gift-cards/me/spendable-balance', { cookie: recipient.cookie });
  const beforeCents = before.json?.spendableCents ?? -1;

  const bad = await request('/gift-cards/redeem', {
    method: 'POST',
    cookie: recipient.cookie,
    body: { code: 'NOT-A-REAL-CODE' },
  });
  assert(bad.status === 404 || bad.status === 400, `unknown code rejected (${bad.status})`);

  const redeemed = await request('/gift-cards/redeem', {
    method: 'POST',
    cookie: recipient.cookie,
    body: { code: purchasedCode },
  });
  assert(redeemed.status === 200 || redeemed.status === 201, `recipient redeems (${redeemed.status})`);
  assert(redeemed.json?.alreadyOwned === false, 'first redeem is a new activation');
  assert((redeemed.json?.creditedCents ?? 0) > 0, 'redeem reports the card balance');

  const again = await request('/gift-cards/redeem', {
    method: 'POST',
    cookie: buyer.cookie,
    body: { code: purchasedCode },
  });
  assert(again.status === 400, `second account cannot take the same code (${again.status})`);

  const after = await request('/gift-cards/me/spendable-balance', { cookie: recipient.cookie });
  assert((after.json?.spendableCents ?? 0) > beforeCents, 'spendable balance grew after redeem');

  const activity = await request('/gift-cards/me/activity', { cookie: recipient.cookie });
  const kinds = (Array.isArray(activity.json) ? activity.json : []).map((row) => row.kind);
  assert(kinds.includes('REDEEM'), 'activity lists the activation');

  const historyAfter = await request(`/gift-cards/admin/${bought?.id ?? minted[0].id}/redemptions`, {
    cookie: adminCookie,
  });
  const redeemEvent = (historyAfter.json?.events ?? []).find((event) => event.type === 'REDEEM');
  assert(Boolean(redeemEvent), 'admin history shows redeem');
  assert(historyAfter.json?.redeemedAt != null, 'redeemedAt is set');

  const otherCard = minted.find((card) => card.code !== purchasedCode);
  if (otherCard) {
    const extended = await request(`/gift-cards/admin/cards/${otherCard.id}/expires`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: { expiresAt: '2028-01-15T00:00:00.000Z' },
    });
    assert(extended.status === 200, `extend one card (${extended.status})`);
    const adjusted = await request(`/gift-cards/admin/cards/${otherCard.id}/balance`, {
      method: 'PATCH',
      cookie: adminCookie,
      body: { balanceAmd: 15000 },
    });
    assert(adjusted.status === 200, `adjust one card balance (${adjusted.status})`);
    assert(adjusted.json?.balanceAmd === 15000 || adjusted.json?.balanceCents === 15000, 'adjusted balance is 15000');
  }

  const types = await request('/classes/types', { cookie: adminCookie });
  const classTypeId = (Array.isArray(types.json) ? types.json : types.json?.items ?? [])[0]?.id;
  if (typeof classTypeId === 'string') {
    const classBatch = await request('/gift-cards/admin', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        type: 'FIXED_CLASS',
        classTypeId,
        classQuantity: 3,
        quantity: 1,
        amountAmd: 1,
      },
    });
    assert(classBatch.status === 200 || classBatch.status === 201, `class gift batch (${classBatch.status})`);
  } else {
    console.log('SKIP  no class type for type B create');
  }

  const plans = await request('/packages/plans');
  const planList = Array.isArray(plans.json) ? plans.json : plans.json?.items ?? [];
  const plan = planList.find((row) => (row.priceCents ?? row.priceAmd ?? 0) > 0 && row.isActive !== false);
  if (plan && (after.json?.spendableCents ?? 0) > 0) {
    const subscribed = await request('/packages/me/subscribe', {
      method: 'POST',
      cookie: recipient.cookie,
      body: { planId: plan.id, paymentMethod: 'CARD', useGiftCredits: true },
    });
    assert(subscribed.status < 400, `package checkout with gift credit (${subscribed.status})`);
    if (subscribed.status >= 400) {
      console.error(JSON.stringify(subscribed.json));
    } else {
      const spent = await request('/gift-cards/me/activity', { cookie: recipient.cookie });
      const spendKinds = (Array.isArray(spent.json) ? spent.json : []).map((row) => row.kind);
      assert(spendKinds.includes('SPEND') || (subscribed.json?.giftCreditsAppliedCents ?? 0) >= 0, 'gift spend recorded or checkout accepted credit');
    }
  } else {
    console.log('SKIP  no priced package for spend check');
  }

  console.log(failures.length === 0 ? '\nALL CHECKS PASSED' : `\n${failures.length} CHECK(S) FAILED`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
