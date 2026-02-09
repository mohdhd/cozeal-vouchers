import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Institution, User, Order } from "@/lib/models";

// GET - Get single institution with details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const institution = await Institution.findById(id).lean();
        if (!institution) {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        // Get contacts
        const contacts = await User.find({
            institutionId: id,
            role: "INSTITUTION_CONTACT",
        }).lean();

        // Get order stats
        const orderStats = await Order.aggregate([
            { $match: { institutionId: institution._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
                    totalVouchers: { $sum: "$quantity" },
                },
            },
        ]);

        return NextResponse.json({
            success: true,
            institution: {
                ...institution,
                contacts,
                stats: orderStats[0] || { totalOrders: 0, totalSpent: 0, totalVouchers: 0 },
            },
        });
    } catch (error) {
        console.error("Failed to fetch institution:", error);
        return NextResponse.json(
            { error: "Failed to fetch institution" },
            { status: 500 }
        );
    }
}

// PUT - Update institution
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

        await dbConnect();

        // Remove fields that shouldn't be updated directly
        const { status, approvedAt, approvedBy, rejectionReason, ...updateData } = body;

        const institution = await Institution.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!institution) {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            institution,
        });
    } catch (error) {
        console.error("Failed to update institution:", error);
        return NextResponse.json(
            { error: "Failed to update institution" },
            { status: 500 }
        );
    }
}
