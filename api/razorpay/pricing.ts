import { GermanLevel } from '../../types';

export const PRICE_BY_LEVEL: Record<GermanLevel, number> = {
  [GermanLevel.A1]: 1499,
  [GermanLevel.A2]: 2999,
  [GermanLevel.B1]: 2999,
  [GermanLevel.B2]: 2999,
  [GermanLevel.C1]: 2999,
  [GermanLevel.C2]: 2999
};

export const getDiscountLimit = (streak: number) => {
  if (streak >= 30) return 0.3;
  if (streak >= 7) return 0.25;
  return 0.2;
};

export const getMaxUsableTokens = (credits: number, basePrice: number, streak: number) => {
  const maxDiscountAmount = basePrice * getDiscountLimit(streak);
  const maxTokensForDiscount = Math.floor(maxDiscountAmount);
  return Math.min(credits, maxTokensForDiscount);
};

export const sanitizeTokens = (requestedTokens: number, credits: number, basePrice: number, streak: number) => {
  if (!Number.isFinite(requestedTokens) || requestedTokens < 0) return 0;
  const maxTokens = getMaxUsableTokens(credits, basePrice, streak);
  return Math.min(Math.floor(requestedTokens), maxTokens);
};
