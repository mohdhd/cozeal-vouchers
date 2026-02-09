import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { createPasswordResetToken } from "@/lib/auth";
import { sendEmail, getPasswordResetEmailHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, locale = "en" } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Always return success to prevent email enumeration
        const token = await createPasswordResetToken(email);

        if (token) {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                const resetUrl = `${appUrl}/${locale}/auth/reset-password?token=${token}`;

                await sendEmail({
                    to: email,
                    subject: locale === "ar" ? "إعادة تعيين كلمة المرور - Cozeal Vouchers" : "Reset Your Password - Cozeal Vouchers",
                    html: getPasswordResetEmailHtml(user.name, resetUrl, locale),
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Failed to process request. Please try again." },
            { status: 500 }
        );
    }
}
