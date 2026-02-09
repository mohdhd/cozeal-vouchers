import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Institution, User } from "@/lib/models";
import { sendEmail, getInstitutionRejectedEmailHtml } from "@/lib/email";

// POST - Reject institution
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
        const { reason, locale = "en" } = body;

        if (!reason) {
            return NextResponse.json(
                { error: "Rejection reason is required" },
                { status: 400 }
            );
        }

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
            status: "REJECTED",
            rejectionReason: reason,
        });

        // Get contact to send notification
        const contact = await User.findOne({
            institutionId: id,
            role: "INSTITUTION_CONTACT",
        });

        if (contact) {
            await sendEmail({
                to: contact.email,
                subject: locale === "ar"
                    ? "تحديث حالة الطلب - Cozeal Vouchers"
                    : "Application Status Update - Cozeal Vouchers",
                html: getInstitutionRejectedEmailHtml(
                    contact.name,
                    locale === "ar" ? institution.nameAr : institution.nameEn,
                    reason,
                    locale
                ),
            });
        }

        return NextResponse.json({
            success: true,
            message: "Institution rejected",
        });
    } catch (error) {
        console.error("Failed to reject institution:", error);
        return NextResponse.json(
            { error: "Failed to reject institution" },
            { status: 500 }
        );
    }
}
