import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Certificate, Voucher } from "@/lib/models";

// GET - List all certificates with admin details
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const certificates = await Certificate.find()
            .sort({ sortOrder: 1, nameEn: 1 })
            .lean();

        // Get available voucher counts for each certificate
        const certificatesWithCounts = await Promise.all(
            certificates.map(async (cert) => {
                const availableCount = await Voucher.countDocuments({
                    certificateId: cert._id,
                    status: "AVAILABLE",
                });
                return {
                    ...cert,
                    availableVouchers: availableCount,
                };
            })
        );

        return NextResponse.json({
            success: true,
            certificates: certificatesWithCounts,
        });
    } catch (error) {
        console.error("Failed to fetch certificates:", error);
        return NextResponse.json(
            { error: "Failed to fetch certificates" },
            { status: 500 }
        );
    }
}

// POST - Create new certificate
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            code,
            nameEn,
            nameAr,
            descriptionEn,
            descriptionAr,
            examCode,
            retailPrice,
            institutionBasePrice,
            validityMonths = 12,
            sortOrder = 0,
            imageUrl,
        } = body;

        // Validation
        if (!code || !nameEn || !nameAr || !descriptionEn || !descriptionAr || !examCode) {
            return NextResponse.json(
                { error: "Required fields are missing" },
                { status: 400 }
            );
        }

        if (!retailPrice || !institutionBasePrice) {
            return NextResponse.json(
                { error: "Prices are required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if code already exists
        const existing = await Certificate.findOne({ code: code.toUpperCase() });
        if (existing) {
            return NextResponse.json(
                { error: "A certificate with this code already exists" },
                { status: 409 }
            );
        }

        const certificate = await Certificate.create({
            code: code.toUpperCase(),
            nameEn,
            nameAr,
            descriptionEn,
            descriptionAr,
            examCode,
            retailPrice,
            institutionBasePrice,
            validityMonths,
            sortOrder,
            imageUrl,
            isActive: true,
        });

        return NextResponse.json({
            success: true,
            certificate,
        });
    } catch (error) {
        console.error("Failed to create certificate:", error);
        return NextResponse.json(
            { error: "Failed to create certificate" },
            { status: 500 }
        );
    }
}
