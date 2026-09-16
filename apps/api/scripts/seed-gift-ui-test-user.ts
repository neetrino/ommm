/**
 * Seeds a temporary member + two gift cards for manual/UI verification.
 * Prints credentials. Cleanup: --cleanup
 */
import {
  GiftCardStatus,
  PrismaClient,
  Role,
} from '@prisma/client';
import { hashPassword } from '../src/common/password-crypto';

const prisma = new PrismaClient();
const EMAIL = 'gift.ui.test@example.com';
const PASSWORD = 'GiftUiTest123!';
const MARKER = 'GIFTUI';

async function cleanup() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (user) {
    await prisma.giftCard.deleteMany({
      where: {
        OR: [
          { recipientId: user.id },
          { purchaserId: user.id },
          { code: { startsWith: MARKER } },
        ],
      },
    });
    await prisma.user.delete({ where: { id: user.id } });
  } else {
    await prisma.giftCard.deleteMany({
      where: { code: { startsWith: MARKER } },
    });
  }
}

async function main() {
  if (process.argv.includes('--cleanup')) {
    await cleanup();
    console.log('Cleaned up UI test user/cards');
    return;
  }

  await cleanup();
  const passwordHash = await hashPassword(PASSWORD);
  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      passwordHash,
      name: 'Gift',
      lastName: 'UiTest',
      phone: `+37491${String(Date.now()).slice(-6)}`,
      role: Role.USER,
      emailVerified: new Date(),
    },
  });

  const soonCode = `${MARKER}SOON`;
  const laterCode = `${MARKER}LATER`;
  await prisma.giftCard.createMany({
    data: [
      {
        code: soonCode,
        amountAmd: 7_000,
        balanceAmd: 7_000,
        status: GiftCardStatus.ACTIVE,
        recipientId: user.id,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        code: laterCode,
        amountAmd: 4_000,
        balanceAmd: 4_000,
        status: GiftCardStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(
    JSON.stringify(
      {
        email: EMAIL,
        password: PASSWORD,
        redeemCode: laterCode,
        expectedSpendableAfterRedeem: 11_000,
        loginUrl: 'http://localhost:3000/en/login',
        giftCardsUrl: 'http://localhost:3000/en/user/gift-cards',
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
