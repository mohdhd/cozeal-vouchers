import "server-only";
import dbConnect from "./db";
import { DiscountCode } from "./models";
import type { DiscountInfo } from "./pricing";

export interface DiscountValidationResult {
  valid: boolean;
  discount?: DiscountInfo;
  error?: {
    en: string;
    ar: string;
  };
}

export async function validateDiscountCode(
  code: string,
  quantity: number,
  universityName?: string
): Promise<DiscountValidationResult> {
  await dbConnect();
  const normalizedCode = code.toUpperCase().trim();

  const discountCode = await DiscountCode.findOne({ code: normalizedCode });

  if (!discountCode) {
    return {
      valid: false,
      error: {
        en: "Invalid discount code",
        ar: "كود الخصم غير صالح",
      },
    };
  }

  if (!discountCode.isActive) {
    return {
      valid: false,
      error: {
        en: "This discount code is no longer active",
        ar: "كود الخصم لم يعد فعالاً",
      },
    };
  }

  const now = new Date();
  if (now < discountCode.validFrom) {
    return {
      valid: false,
      error: {
        en: "This discount code is not yet active",
        ar: "كود الخصم لم يبدأ بعد",
      },
    };
  }

  if (now > discountCode.validUntil) {
    return {
      valid: false,
      error: {
        en: "This discount code has expired",
        ar: "كود الخصم منتهي الصلاحية",
      },
    };
  }

  if (discountCode.maxUses && discountCode.usedCount >= discountCode.maxUses) {
    return {
      valid: false,
      error: {
        en: "This discount code has reached its usage limit",
        ar: "تم استنفاد الحد الأقصى لاستخدام كود الخصم",
      },
    };
  }

  if (discountCode.minQuantity && quantity < discountCode.minQuantity) {
    return {
      valid: false,
      error: {
        en: `Minimum ${discountCode.minQuantity} vouchers required for this code`,
        ar: `يتطلب هذا الكود حد أدنى ${discountCode.minQuantity} قسيمة`,
      },
    };
  }

  if (discountCode.universityRestriction && universityName) {
    const restrictionLower = discountCode.universityRestriction.toLowerCase();
    const universityLower = universityName.toLowerCase();
    if (!universityLower.includes(restrictionLower) && !restrictionLower.includes(universityLower)) {
      return {
        valid: false,
        error: {
          en: "This code is restricted to a specific university",
          ar: "هذا الكود مخصص لجامعة محددة",
        },
      };
    }
  }

  return {
    valid: true,
    discount: {
      code: discountCode.code,
      type: discountCode.type,
      value: discountCode.value,
      descriptionEn: discountCode.descriptionEn,
      descriptionAr: discountCode.descriptionAr,
    },
  };
}

export async function incrementDiscountUsage(code: string): Promise<void> {
  await dbConnect();
  await DiscountCode.updateOne(
    { code: code.toUpperCase().trim() },
    { $inc: { usedCount: 1 } }
  );
}
