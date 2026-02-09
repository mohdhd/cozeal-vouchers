import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { LegalPage } from "@/lib/models";

// GET - Get legal page by slug (public)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        await dbConnect();

        const page = await LegalPage.findOne({ slug, isPublished: true }).lean();

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            page,
        });
    } catch (error) {
        console.error("Failed to fetch legal page:", error);
        return NextResponse.json(
            { error: "Failed to fetch page" },
            { status: 500 }
        );
    }
}
