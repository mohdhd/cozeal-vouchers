import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { createUser } from "@/lib/auth";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, phone, locale = "en" } = body;

        // Validation
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, password, and name are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // Create user
        const { user, emailVerificationToken } = await createUser(
            email,
            password,
            name,
            phone,
            "INDIVIDUAL"
        );

        // Send verification email
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const verificationUrl = `${appUrl}/${locale}/auth/verify-email?token=${emailVerificationToken}`;

        await sendEmail({
            to: email,
            subject: locale === "ar" ? "تأكيد بريدك الإلكتروني - Cozeal Vouchers" : "Verify Your Email - Cozeal Vouchers",
            html: getVerificationEmailHtml(name, verificationUrl, locale),
        });

        return NextResponse.json({
            success: true,
            message: "Registration successful. Please check your email to verify your account.",
            userId: user._id.toString(),
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Failed to register. Please try again." },
            { status: 500 }
        );
    }
}
