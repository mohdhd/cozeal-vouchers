import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { LegalPage } from "@/lib/models";

// GET - Get single legal page for editing
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        await dbConnect();

        const page = await LegalPage.findOne({ slug }).lean();
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

// PUT - Update legal page (full update)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        const body = await request.json();

        await dbConnect();

        const page = await LegalPage.findOneAndUpdate(
            { slug },
            {
                $set: {
                    ...body,
                    lastUpdatedBy: session.user.id,
                },
            },
            { new: true }
        );

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            page,
        });
    } catch (error) {
        console.error("Failed to update legal page:", error);
        return NextResponse.json(
            { error: "Failed to update page" },
            { status: 500 }
        );
    }
}

// PATCH - Partial update legal page
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        const body = await request.json();

        await dbConnect();

        const page = await LegalPage.findOneAndUpdate(
            { slug },
            {
                $set: {
                    ...body,
                    lastUpdatedBy: session.user.id,
                },
            },
            { new: true }
        );

        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            page,
        });
    } catch (error) {
        console.error("Failed to update legal page:", error);
        return NextResponse.json(
            { error: "Failed to update page" },
            { status: 500 }
        );
    }
}

// DELETE - Delete legal page
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        await dbConnect();

        const result = await LegalPage.findOneAndDelete({ slug });
        if (!result) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Page deleted",
        });
    } catch (error) {
        console.error("Failed to delete legal page:", error);
        return NextResponse.json(
            { error: "Failed to delete page" },
            { status: 500 }
        );
    }
}
