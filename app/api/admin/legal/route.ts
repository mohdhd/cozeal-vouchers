import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { LegalPage } from "@/lib/models";

// GET - List all legal pages
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const pages = await LegalPage.find()
            .select("slug titleEn titleAr contentEn contentAr isPublished updatedAt")
            .sort({ slug: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            pages,
        });
    } catch (error) {
        console.error("Failed to fetch legal pages:", error);
        return NextResponse.json(
            { error: "Failed to fetch pages" },
            { status: 500 }
        );
    }
}

// POST - Create new legal page
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { slug, titleEn, titleAr, contentEn, contentAr, isPublished = false } = body;

        if (!slug || !titleEn || !titleAr || !contentEn || !contentAr) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const existing = await LegalPage.findOne({ slug });
        if (existing) {
            return NextResponse.json(
                { error: "A page with this slug already exists" },
                { status: 409 }
            );
        }

        const page = await LegalPage.create({
            slug: slug.toLowerCase(),
            titleEn,
            titleAr,
            contentEn,
            contentAr,
            isPublished,
            lastUpdatedBy: session.user.id,
        });

        return NextResponse.json({
            success: true,
            page,
        });
    } catch (error) {
        console.error("Failed to create legal page:", error);
        return NextResponse.json(
            { error: "Failed to create page" },
            { status: 500 }
        );
    }
}
