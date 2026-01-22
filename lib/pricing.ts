// Server-only pricing functions (uses mongoose)
import "server-only";
import dbConnect from "./db";
import { Settings } from "./models";
import type { PricingCalculation, DiscountInfo } from "./pricing-client";

// Re-export client types
export type { PricingCalculation, DiscountInfo };
export { calculatePricingClient } from "./pricing-client";

// Default settings
const DEFAULT_BASE_PRICE = 1350;
const DEFAULT_VAT_PERCENT = 15;

export async function getSettings(): Promise<{
  basePrice: number;
  vatPercent: number;
  companyNameEn: string;
  companyNameAr: string;
  companyVatNumber: string;
  companyCrNumber: string;
}> {
  await dbConnect();
  const settings = await Settings.find();
  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  return {
    basePrice: parseFloat(settingsMap.get("voucher_base_price") || String(DEFAULT_BASE_PRICE)),
    vatPercent: parseFloat(settingsMap.get("vat_percentage") || String(DEFAULT_VAT_PERCENT)),
    companyNameEn: settingsMap.get("company_name_en") || "Cozeal",
    companyNameAr: settingsMap.get("company_name_ar") || "كوزيل",
    companyVatNumber: settingsMap.get("company_vat_number") || "",
    companyCrNumber: settingsMap.get("company_cr_number") || "",
  };
}

export async function calculatePricing(
  quantity: number,
  discount?: DiscountInfo | null
): Promise<PricingCalculation> {
  const settings = await getSettings();
  const basePrice = settings.basePrice;
  const vatPercent = settings.vatPercent;

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
