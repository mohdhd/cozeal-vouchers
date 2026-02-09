import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DiscountCode } from "@/lib/models";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const discount = await DiscountCode.findById(id);

    if (!discount) {
      return NextResponse.json(
        { error: "Discount code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(discount);
  } catch (error) {
    console.error("Get discount error:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount code" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.code) updateData.code = body.code.toUpperCase();
    if (body.type) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = body.value;
    if (body.descriptionEn) updateData.descriptionEn = body.descriptionEn;
    if (body.descriptionAr) updateData.descriptionAr = body.descriptionAr;
    if (body.minQuantity !== undefined) updateData.minQuantity = body.minQuantity || null;
    if (body.maxUses !== undefined) updateData.maxUses = body.maxUses || null;
    if (body.validFrom) updateData.validFrom = new Date(body.validFrom);
    if (body.validUntil) updateData.validUntil = new Date(body.validUntil);
    if (body.universityRestriction !== undefined) updateData.universityRestriction = body.universityRestriction || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const discount = await DiscountCode.findByIdAndUpdate(id, updateData, { new: true });

    return NextResponse.json(discount);
  } catch (error) {
    console.error("Update discount error:", error);
    return NextResponse.json(
      { error: "Failed to update discount code" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    await DiscountCode.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete discount error:", error);
    return NextResponse.json(
      { error: "Failed to delete discount code" },
      { status: 500 }
    );
  }
}
