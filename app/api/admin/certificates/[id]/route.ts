import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Certificate, Voucher } from "@/lib/models";

// GET - Get single certificate
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

        const certificate = await Certificate.findById(id).lean();
        if (!certificate) {
            return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
        }

        const availableCount = await Voucher.countDocuments({
            certificateId: certificate._id,
            status: "AVAILABLE",
        });

        return NextResponse.json({
            success: true,
            certificate: {
                ...certificate,
                availableVouchers: availableCount,
            },
        });
    } catch (error) {
        console.error("Failed to fetch certificate:", error);
        return NextResponse.json(
            { error: "Failed to fetch certificate" },
            { status: 500 }
        );
    }
}

// PUT - Update certificate (full update)
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

        const certificate = await Certificate.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!certificate) {
            return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            certificate,
        });
    } catch (error) {
        console.error("Failed to update certificate:", error);
        return NextResponse.json(
            { error: "Failed to update certificate" },
            { status: 500 }
        );
    }
}

// PATCH - Partial update certificate
export async function PATCH(
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

        const certificate = await Certificate.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!certificate) {
            return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            certificate,
        });
    } catch (error) {
        console.error("Failed to update certificate:", error);
        return NextResponse.json(
            { error: "Failed to update certificate" },
            { status: 500 }
        );
    }
}

// DELETE - Delete certificate (soft delete by setting isActive to false)
export async function DELETE(
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

        // Check if there are available vouchers
        const availableCount = await Voucher.countDocuments({
            certificateId: id,
            status: "AVAILABLE",
        });

        if (availableCount > 0) {
            // Soft delete - just deactivate
            await Certificate.findByIdAndUpdate(id, { isActive: false });
        } else {
            // Hard delete if no vouchers
            await Certificate.findByIdAndDelete(id);
        }

        return NextResponse.json({
            success: true,
            message: availableCount > 0 ? "Certificate deactivated" : "Certificate deleted",
        });
    } catch (error) {
        console.error("Failed to delete certificate:", error);
        return NextResponse.json(
            { error: "Failed to delete certificate" },
            { status: 500 }
        );
    }
}
