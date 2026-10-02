import { BadRequestException } from '@nestjs/common';

export type GiftConvertDirection = 'TO_MONEY' | 'TO_CLASSES';

/** Converts at the class drop-in price. Money left over after whole classes stays on the card. */
export function convertGiftBalances(input: {
  direction: GiftConvertDirection;
  balanceAmd: number;
  balanceClasses: number;
  unitPriceAmd: number;
}): { balanceAmd: number; balanceClasses: number } {
  if (!Number.isInteger(input.unitPriceAmd) || input.unitPriceAmd < 1) {
    throw new BadRequestException('This class has no drop-in price');
  }
  if (input.direction === 'TO_MONEY') {
    return {
      balanceAmd: input.balanceAmd + input.balanceClasses * input.unitPriceAmd,
      balanceClasses: 0,
    };
  }
  const classes = Math.floor(input.balanceAmd / input.unitPriceAmd);
  if (classes < 1) {
    throw new BadRequestException('Amount does not cover one class');
  }
  return {
    balanceAmd: input.balanceAmd - classes * input.unitPriceAmd,
    balanceClasses: input.balanceClasses + classes,
  };
}
