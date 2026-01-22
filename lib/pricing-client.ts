// Client-safe pricing calculations (no database/mongoose imports)

export interface PricingCalculation {
  basePrice: number;
  quantity: number;
  subtotal: number;
  discountCode: string | null;
  discountType: "PERCENTAGE" | "FIXED" | null;
  discountValue: number;
  discountPercent: number;
  discountAmount: number;
  afterDiscount: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
}

export interface DiscountInfo {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  descriptionEn: string;
  descriptionAr: string;
}

export function calculatePricingClient(
  quantity: number,
  basePrice: number,
  vatPercent: number,
  discount?: DiscountInfo | null
): PricingCalculation {
  const subtotal = basePrice * quantity;

  let discountAmount = 0;
  let discountPercent = 0;

  if (discount) {
    if (discount.type === "PERCENTAGE") {
      discountPercent = discount.value;
      discountAmount = subtotal * (discount.value / 100);
    } else {
      discountAmount = discount.value * quantity;
      discountPercent = Math.round((discountAmount / subtotal) * 100);
    }
  }

  const afterDiscount = subtotal - discountAmount;
  const vatAmount = afterDiscount * (vatPercent / 100);
  const total = afterDiscount + vatAmount;

  return {
    basePrice,
    quantity,
    subtotal,
    discountCode: discount?.code || null,
    discountType: discount?.type || null,
    discountValue: discount?.value || 0,
    discountPercent,
    discountAmount,
    afterDiscount,
    vatPercent,
    vatAmount,
    total,
  };
}
