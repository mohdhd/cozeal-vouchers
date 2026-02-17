"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailContent() {
    const t = useTranslations("auth");
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    const [status, setStatus] = useState<"loading" | "success" | "error">(
        error ? "error" : "loading"
    );
    const [message, setMessage] = useState(
        error === "invalid_token"
            ? "Invalid or expired verification token."
            : error === "missing_token"
                ? "Verification token is missing."
                : ""
    );

    useEffect(() => {
        if (!token || error) {
            if (!token && !error) {
                setStatus("error");
                setMessage("Verification token is missing.");
            }
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await fetch("/api/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus("success");
                    setMessage(data.message || "Email verified successfully. You can now log in.");
                } else {
                    setStatus("error");
                    setMessage(data.error || "Invalid or expired verification token.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("An error occurred while verifying your email. Please try again.");
            }
        };

        verifyEmail();
    }, [token, error]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>
                    {status === "loading"
                        ? "Verifying Your Email"
                        : status === "success"
                            ? "Email Verified!"
                            : "Verification Failed"}
                </CardTitle>
                <CardDescription>
                    {status === "loading"
                        ? "Please wait while we verify your email address..."
                        : status === "success"
                            ? "Your account is now active."
                            : "We couldn't verify your email."}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 py-8">
                {status === "loading" && (
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                )}
                {status === "success" && (
                    <>
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <p className="text-center text-muted-foreground">{message}</p>
                        <Link href="/login" className="w-full">
                            <Button className="w-full">
                                {t("signIn")}
                            </Button>
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <XCircle className="h-16 w-16 text-red-500" />
                        <p className="text-center text-muted-foreground">{message}</p>
                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full">
                                {t("signIn")}
                            </Button>
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-4">
                <Suspense
                    fallback={
                        <Card className="w-full max-w-md">
                            <CardContent className="flex items-center justify-center py-12">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            </CardContent>
                        </Card>
                    }
                >
                    <VerifyEmailContent />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
