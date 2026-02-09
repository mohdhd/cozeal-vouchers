import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { connectDB } from "@/lib/db";
import { Institution } from "@/lib/models/Institution";
import { Clock, Mail, Phone, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getInstitution(institutionId: string) {
  await connectDB();
  const institution = await Institution.findById(institutionId).lean();
  return institution ? JSON.parse(JSON.stringify(institution)) : null;
}

export default async function InstitutionPendingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role !== "INSTITUTION_CONTACT" || !session.user.institutionId) {
    redirect(`/${locale}/account`);
  }

  const institution = await getInstitution(session.user.institutionId);
  const t = await getTranslations("institutions.pending");

  if (!institution) {
    redirect(`/${locale}/login`);
  }

  // If approved, redirect to dashboard
  if (institution.status === "APPROVED") {
    redirect(`/${locale}/institutions/dashboard`);
  }

  // If rejected, show different message
  const isRejected = institution.status === "REJECTED";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center ${
              isRejected ? "bg-red-100" : "bg-yellow-100"
            }`}>
              {isRejected ? (
                <XCircle className="h-8 w-8 text-red-600" />
              ) : (
                <Clock className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <CardTitle>
              {isRejected ? t("rejectedTitle") : t("pendingTitle")}
            </CardTitle>
            <CardDescription>
              {isRejected ? t("rejectedDescription") : t("pendingDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Institution Details */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium">{t("institutionDetails")}</h4>
              <p className="text-sm">
                {locale === "ar" ? institution.nameAr : institution.nameEn}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(`type.${institution.type}`)}
              </p>
            </div>

            {/* Rejection Reason */}
            {isRejected && institution.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">{t("rejectionReason")}</h4>
                <p className="text-sm text-red-700">{institution.rejectionReason}</p>
              </div>
            )}

            {/* Pending Status Info */}
            {!isRejected && (
              <div className="space-y-4">
                <h4 className="font-medium">{t("whatHappensNext")}</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("step1")}</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("step2")}</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("step3")}</p>
                  </li>
                </ul>
              </div>
            )}

            {/* Contact Support */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{t("needHelp")}</h4>
              <div className="space-y-2 text-sm">
                <a href="mailto:support@cozeal.ai" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Mail className="h-4 w-4" />
                  support@cozeal.ai
                </a>
                <a href="tel:+966123456789" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Phone className="h-4 w-4" />
                  +966 12 345 6789
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
