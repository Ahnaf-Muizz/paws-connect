export const PROCEEDS_MESSAGE = "Proceeds from sales go to animal shelters.";
export const TAX_RATE = 0.0825;

export type Coupon = {
  code: string;
  label: string;
  detail: string;
  pct?: number;
  amountCents?: number;
};

export const COUPONS: Record<string, Coupon> = {
  PAWS10: { code: "PAWS10", label: "10% off", detail: "10% off your care order", pct: 10 },
  SHELTER15: { code: "SHELTER15", label: "15% off", detail: "15% off, with extra going to local shelters", pct: 15 },
  WELCOME5: { code: "WELCOME5", label: "$5 off", detail: "$5 off any shop order", amountCents: 500 },
};

export function normalizeCoupon(code?: string | null): string {
  return (code ?? "").trim().toUpperCase();
}

export function getCoupon(code?: string | null): Coupon | null {
  const key = normalizeCoupon(code);
  return key ? (COUPONS[key] ?? null) : null;
}

export function salePriceCents(listPriceCents: number, salePct = 0): number {
  if (salePct <= 0) return listPriceCents;
  return Math.max(0, Math.round(listPriceCents * (1 - salePct / 100)));
}

export function couponDiscountCents(subtotalCents: number, code?: string | null): { discountCents: number; coupon: Coupon | null } {
  const coupon = getCoupon(code);
  if (!coupon || subtotalCents <= 0) return { discountCents: 0, coupon };
  const raw = coupon.pct ? Math.round(subtotalCents * (coupon.pct / 100)) : (coupon.amountCents ?? 0);
  return { discountCents: Math.min(subtotalCents, raw), coupon };
}

export function orderTotals(subtotalCents: number, taxRate: number, code?: string | null) {
  const { discountCents, coupon } = couponDiscountCents(subtotalCents, code);
  const taxable = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(taxable * taxRate);
  return { subtotalCents, discountCents, taxCents, totalCents: taxable + taxCents, coupon };
}
