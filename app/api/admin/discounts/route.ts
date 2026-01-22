import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DiscountCode } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const {
      code,
      type,
      value,
      descriptionEn,
      descriptionAr,
      minQuantity,
      maxUses,
      validFrom,
      validUntil,
      universityRestriction,
    } = body;

    const existing = await DiscountCode.findOne({ code: code.toUpperCase() });

    if (existing) {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      );
    }

    const discount = await DiscountCode.create({
      code: code.toUpperCase(),
      type,
      value,
      descriptionEn,
      descriptionAr,
      minQuantity: minQuantity || null,
      maxUses: maxUses || null,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      universityRestriction: universityRestriction || null,
      isActive: true,
    });

    return NextResponse.json(discount);
  } catch (error) {
    console.error("Create discount error:", error);
    return NextResponse.json(
      { error: "Failed to create discount code" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const discounts = await DiscountCode.find().sort({ createdAt: -1 });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Get discounts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount codes" },
      { status: 500 }
    );
  }
}
