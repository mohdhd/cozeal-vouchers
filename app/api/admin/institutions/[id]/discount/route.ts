import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Institution } from "@/lib/models";

// PUT - Set custom discount for institution
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { discountType, discountValue } = body;

        if (discountType && !["PERCENTAGE", "FIXED"].includes(discountType)) {
            return NextResponse.json(
                { error: "Invalid discount type" },
                { status: 400 }
            );
        }

        if (discountType === "PERCENTAGE" && (discountValue < 0 || discountValue > 100)) {
            return NextResponse.json(
                { error: "Percentage discount must be between 0 and 100" },
                { status: 400 }
            );
        }

        if (discountType === "FIXED" && discountValue < 0) {
            return NextResponse.json(
                { error: "Fixed discount must be positive" },
                { status: 400 }
            );
        }

        await dbConnect();

        const updateData: Record<string, unknown> = {};

        if (discountType && discountValue !== undefined) {
            updateData.discountType = discountType;
            updateData.discountValue = discountValue;
        } else {
            // Remove discount if not provided
            updateData.$unset = { discountType: "", discountValue: "" };
        }

        const institution = await Institution.findByIdAndUpdate(
            id,
            discountType ? { $set: { discountType, discountValue } } : { $unset: { discountType: "", discountValue: "" } },
            { new: true }
        );

        if (!institution) {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            institution,
            message: discountType
                ? `Discount set: ${discountValue}${discountType === "PERCENTAGE" ? "%" : " SAR"}`
                : "Discount removed",
        });
    } catch (error) {
        console.error("Failed to set institution discount:", error);
        return NextResponse.json(
            { error: "Failed to set institution discount" },
            { status: 500 }
        );
    }
}
