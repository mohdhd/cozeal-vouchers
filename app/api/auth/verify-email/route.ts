import { NextRequest, NextResponse } from "next/server";
import { verifyUserEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: "Verification token is required" },
                { status: 400 }
            );
        }

        const success = await verifyUserEmail(token);

        if (!success) {
            return NextResponse.json(
                { error: "Invalid or expired verification token" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Email verified successfully. You can now log in.",
        });
    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.json(
            { error: "Failed to verify email. Please try again." },
            { status: 500 }
        );
    }
}

// Also support GET for direct link clicks
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.redirect(new URL("/auth/verify-email?error=missing_token", request.url));
    }

    const success = await verifyUserEmail(token);

    if (!success) {
        return NextResponse.redirect(new URL("/auth/verify-email?error=invalid_token", request.url));
    }

    return NextResponse.redirect(new URL("/auth/login?verified=true", request.url));
}
