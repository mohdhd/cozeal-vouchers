import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models/User";
import { Institution } from "@/lib/models/Institution";

// GET - List users with filters
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search");

        await dbConnect();

        const query: Record<string, unknown> = {};
        
        // Exclude admin role users from the list
        if (role && role !== "ALL") {
            query.role = role;
        } else {
            query.role = { $in: ["INDIVIDUAL", "INSTITUTION_CONTACT"] };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User.countDocuments(query),
        ]);

        // Get institution names for institution contacts
        const usersWithInstitutions = await Promise.all(
            users.map(async (user) => {
                let institutionName = null;
                if (user.institutionId) {
                    const institution = await Institution.findById(user.institutionId).lean();
                    institutionName = institution?.nameEn;
                }
                return {
                    ...user,
                    institutionName,
                };
            })
        );

        return NextResponse.json({
            success: true,
            users: usersWithInstitutions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
