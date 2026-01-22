import { NextRequest, NextResponse } from "next/server";
import { validateDiscountCode } from "@/lib/discount";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, quantity, universityName } = body;

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          error: { en: "Code is required", ar: "الكود مطلوب" },
        },
        { status: 400 }
      );
    }

    const result = await validateDiscountCode(
      code,
      quantity || 1,
      universityName
    );

    if (result.valid && result.discount) {
      return NextResponse.json({
        valid: true,
        discount: {
          code: result.discount.code,
          type: result.discount.type,
          value: result.discount.value,
          descriptionEn: result.discount.descriptionEn,
          descriptionAr: result.discount.descriptionAr,
        },
      });
    }

    return NextResponse.json({
      valid: false,
      error: result.error,
    });
  } catch (error) {
    console.error("Discount validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: { en: "Server error", ar: "خطأ في الخادم" },
      },
      { status: 500 }
    );
  }
}
