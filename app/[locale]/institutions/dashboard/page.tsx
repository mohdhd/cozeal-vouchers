import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Header, Footer } from "@/components/layout";
import { InstitutionDashboard } from "@/components/institutions/institution-dashboard";
import { connectDB } from "@/lib/db";
import { Institution } from "@/lib/models/Institution";
import { Certificate } from "@/lib/models/Certificate";
import { Order } from "@/lib/models";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getInstitutionData(institutionId: string) {
  await connectDB();

  const [institution, certificates, orders] = await Promise.all([
    Institution.findById(institutionId).lean(),
    Certificate.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    Order.find({ institutionId }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return {
    institution: institution ? JSON.parse(JSON.stringify(institution)) : null,
    certificates: JSON.parse(JSON.stringify(certificates)),
    orders: JSON.parse(JSON.stringify(orders)),
  };
}

export default async function InstitutionDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role !== "INSTITUTION_CONTACT" || !session.user.institutionId) {
    redirect(`/${locale}/account`);
  }

  const { institution, certificates, orders } = await getInstitutionData(
    session.user.institutionId
  );

  if (!institution) {
    redirect(`/${locale}/login`);
  }

  // If not approved, redirect to pending page
  if (institution.status !== "APPROVED") {
    redirect(`/${locale}/institutions/pending`);
  }

  const t = await getTranslations("institutions.dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {t("welcome", { name: locale === "ar" ? institution.nameAr : institution.nameEn })}
            </h1>
            <p className="text-muted-foreground mt-2">{t("description")}</p>
          </div>
          <InstitutionDashboard
            institution={institution}
            certificates={certificates}
            orders={orders}
            user={session.user}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
