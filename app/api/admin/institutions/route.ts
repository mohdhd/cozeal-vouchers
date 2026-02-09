import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Institution, User } from "@/lib/models";

// GET - List institutions with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const type = searchParams.get("type");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search");

        await dbConnect();

        const query: Record<string, unknown> = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { nameEn: { $regex: search, $options: "i" } },
                { nameAr: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const [institutions, total] = await Promise.all([
            Institution.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Institution.countDocuments(query),
        ]);

        // Get contact person for each institution
        const institutionsWithContacts = await Promise.all(
            institutions.map(async (inst) => {
                const contact = await User.findOne({
                    institutionId: inst._id,
                    role: "INSTITUTION_CONTACT",
                }).lean();
                return {
                    ...inst,
                    contact: contact ? { name: contact.name, email: contact.email, phone: contact.phone } : null,
                };
            })
        );

        return NextResponse.json({
            success: true,
            institutions: institutionsWithContacts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Failed to fetch institutions:", error);
        return NextResponse.json(
            { error: "Failed to fetch institutions" },
            { status: 500 }
        );
    }
}
