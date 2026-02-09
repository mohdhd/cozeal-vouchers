import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Institution, User } from "@/lib/models";
import { sendEmail, getInstitutionApprovedEmailHtml } from "@/lib/email";

// POST - Approve institution
export async function POST(
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
        const { locale = "en" } = body;

        await dbConnect();

        const institution = await Institution.findById(id);
        if (!institution) {
            return NextResponse.json({ error: "Institution not found" }, { status: 404 });
        }

        if (institution.status !== "PENDING") {
            return NextResponse.json(
                { error: "Institution is not pending approval" },
                { status: 400 }
            );
        }

        // Update institution status
        await Institution.findByIdAndUpdate(id, {
            status: "APPROVED",
            approvedAt: new Date(),
            approvedBy: session.user.id,
        });

        // Get contact to send notification
        const contact = await User.findOne({
            institutionId: id,
            role: "INSTITUTION_CONTACT",
        });

        if (contact) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const loginUrl = `${appUrl}/${locale}/auth/login`;

            await sendEmail({
                to: contact.email,
                subject: locale === "ar"
                    ? "تمت الموافقة على حسابكم - Cozeal Vouchers"
                    : "Your Account Has Been Approved - Cozeal Vouchers",
                html: getInstitutionApprovedEmailHtml(
                    contact.name,
                    locale === "ar" ? institution.nameAr : institution.nameEn,
                    loginUrl,
                    locale
                ),
            });
        }

        return NextResponse.json({
            success: true,
            message: "Institution approved successfully",
        });
    } catch (error) {
        console.error("Failed to approve institution:", error);
        return NextResponse.json(
            { error: "Failed to approve institution" },
            { status: 500 }
        );
    }
}
