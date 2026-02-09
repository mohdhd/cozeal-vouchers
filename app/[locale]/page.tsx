import { setRequestLocale } from "next-intl/server";
import { Header, Footer } from "@/components/layout";
import { HeroSection, FeaturesSection, PopularCertificates, InstitutionCTA } from "@/components/home";
import dbConnect from "@/lib/db";
import { Certificate } from "@/lib/models";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getPopularCertificates() {
  try {
    await dbConnect();
    const certificates = await Certificate.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .limit(6)
      .lean();
    
    return certificates.map((cert: any) => ({
      _id: cert._id.toString(),
      slug: cert.slug,
      code: cert.code,
      nameEn: cert.nameEn,
      nameAr: cert.nameAr,
      descriptionEn: cert.descriptionEn,
      descriptionAr: cert.descriptionAr,
      category: cert.category,
      retailPrice: cert.retailPrice,
      examCodes: cert.examCodes || [cert.examCode],
    }));
  } catch (error) {
    console.error("Failed to fetch certificates:", error);
    return [];
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const certificates = await getPopularCertificates();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <PopularCertificates certificates={certificates} />
        <FeaturesSection />
        <InstitutionCTA />
      </main>
      <Footer />
    </div>
  );
}
