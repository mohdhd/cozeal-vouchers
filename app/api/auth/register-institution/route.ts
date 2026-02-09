import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User, Institution } from "@/lib/models";
import { createUser } from "@/lib/auth";
import { sendEmail, getVerificationEmailHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            // Contact person info
            email,
            password,
            name,
            phone,
            // Institution info
            institutionNameEn,
            institutionNameAr,
            institutionType,
            vatNumber,
            crNumber,
            institutionEmail,
            institutionPhone,
            address,
            city,
            locale = "en",
        } = body;

        // Validation
        if (!email || !password || !name || !institutionNameEn || !institutionNameAr || !institutionType) {
            return NextResponse.json(
                { error: "Required fields are missing" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        const validTypes = ["UNIVERSITY", "COMPANY", "TRAINING_CENTER", "GOVERNMENT", "OTHER"];
        if (!validTypes.includes(institutionType)) {
            return NextResponse.json(
                { error: "Invalid institution type" },
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

        // Check if institution email already registered
        const existingInstitution = await Institution.findOne({
            email: (institutionEmail || email).toLowerCase()
        });
        if (existingInstitution) {
            return NextResponse.json(
                { error: "An institution with this email already exists" },
                { status: 409 }
            );
        }

        // Create institution (pending approval)
        const institution = await Institution.create({
            nameEn: institutionNameEn,
            nameAr: institutionNameAr,
            type: institutionType,
            vatNumber,
            crNumber,
            email: (institutionEmail || email).toLowerCase(),
            phone: institutionPhone || phone,
            address,
            city,
            status: "PENDING",
        });

        // Create user linked to institution
        const { user, emailVerificationToken } = await createUser(
            email,
            password,
            name,
            phone,
            "INSTITUTION_CONTACT",
            institution._id.toString()
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
            message: "Registration successful. Please verify your email. Your institution account is pending admin approval.",
            userId: user._id.toString(),
            institutionId: institution._id.toString(),
        });
    } catch (error) {
        console.error("Institution registration error:", error);
        return NextResponse.json(
            { error: "Failed to register. Please try again." },
            { status: 500 }
        );
    }
}
