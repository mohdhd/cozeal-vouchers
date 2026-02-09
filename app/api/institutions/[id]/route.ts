import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Institution } from "@/lib/models";

// GET - Get institution data for institution contacts
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Only allow institution contacts to access their own institution
        if (session.user.role === "INSTITUTION_CONTACT") {
            if (session.user.institutionId !== id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
        } else if (session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();

        const institution = await Institution.findById(id)
            .select("nameEn nameAr status discountType discountValue type contactEmail contactPhone")
            .lean();

        if (!institution) {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        // Only allow access to approved institutions (unless admin)
        if (session.user.role !== "ADMIN" && institution.status !== "APPROVED") {
            return NextResponse.json({ error: "Institution not approved" }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            institution,
        });
    } catch (error) {
        console.error("Failed to fetch institution:", error);
        return NextResponse.json(
            { error: "Failed to fetch institution" },
            { status: 500 }
        );
    }
}
