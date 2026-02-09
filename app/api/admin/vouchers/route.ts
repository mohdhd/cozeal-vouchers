import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Voucher, Certificate } from "@/lib/models";

// GET - List vouchers with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const certificateId = searchParams.get("certificateId");
        const batchId = searchParams.get("batchId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search");

        await dbConnect();

        // Build query
        const query: Record<string, unknown> = {};
        if (status) query.status = status;
        if (certificateId) query.certificateId = certificateId;
        if (batchId) query.batchId = batchId;
        if (search) query.code = { $regex: search, $options: "i" };

        const [vouchers, total] = await Promise.all([
            Voucher.find(query)
                .populate("certificateId", "code nameEn nameAr")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Voucher.countDocuments(query),
        ]);

        return NextResponse.json({
            success: true,
            vouchers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Failed to fetch vouchers:", error);
        return NextResponse.json(
            { error: "Failed to fetch vouchers" },
            { status: 500 }
        );
    }
}

// POST - Create single voucher
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { code, certificateId, purchasedAt, purchasePrice, expiresAt, batchId } = body;

        if (!code || !certificateId || !purchasedAt || !purchasePrice || !expiresAt) {
            return NextResponse.json(
                { error: "Required fields are missing" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Validate certificate exists
        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            return NextResponse.json(
                { error: "Certificate not found" },
                { status: 404 }
            );
        }

        // Check for duplicate voucher code
        const existing = await Voucher.findOne({ code });
        if (existing) {
            return NextResponse.json(
                { error: "A voucher with this code already exists" },
                { status: 409 }
            );
        }

        const voucher = await Voucher.create({
            code,
            certificateId,
            status: "AVAILABLE",
            purchasedAt: new Date(purchasedAt),
            purchasePrice,
            expiresAt: new Date(expiresAt),
            batchId,
        });

        return NextResponse.json({
            success: true,
            voucher,
        });
    } catch (error) {
        console.error("Failed to create voucher:", error);
        return NextResponse.json(
            { error: "Failed to create voucher" },
            { status: 500 }
        );
    }
}
