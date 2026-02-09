import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Certificate } from "@/lib/models";

// GET - List all active certificates (public)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const certificates = await Certificate.find({ isActive: true })
            .sort({ sortOrder: 1, nameEn: 1 })
            .select("_id code slug nameEn nameAr descriptionEn descriptionAr category retailPrice institutionBasePrice examCode examCodes validityMonths")
            .lean();

        return NextResponse.json({
            success: true,
            certificates: certificates.map((cert: any) => ({
                _id: cert._id.toString(),
                code: cert.code,
                slug: cert.slug,
                nameEn: cert.nameEn,
                nameAr: cert.nameAr,
                descriptionEn: cert.descriptionEn,
                descriptionAr: cert.descriptionAr,
                category: cert.category,
                retailPrice: cert.retailPrice,
                institutionBasePrice: cert.institutionBasePrice,
                examCodes: cert.examCodes || [cert.examCode],
                validityMonths: cert.validityMonths,
            })),
        });
    } catch (error) {
        console.error("Failed to fetch certificates:", error);
        return NextResponse.json(
            { error: "Failed to fetch certificates" },
            { status: 500 }
        );
    }
}
