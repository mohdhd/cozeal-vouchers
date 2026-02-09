import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { connectDB } from "@/lib/db";
import { LegalPage } from "@/lib/models/LegalPage";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getLegalPage(slug: string) {
  await connectDB();
  const page = await LegalPage.findOne({ slug, isPublished: true }).lean();
  return page ? JSON.parse(JSON.stringify(page)) : null;
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const page = await getLegalPage(slug);

  if (!page) {
    return { title: "Page Not Found" };
  }

  const title = locale === "ar" ? page.titleAr : page.titleEn;

  return {
    title: `${title} | Cozeal Vouchers`,
  };
}

export default async function LegalPageDisplay({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getLegalPage(slug);

  if (!page) {
    notFound();
  }

  const isRTL = locale === "ar";
  const title = isRTL ? page.titleAr : page.titleEn;
  const content = isRTL ? page.contentAr : page.contentEn;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "آخر تحديث:" : "Last updated:"} {formatDate(page.updatedAt)}
              </p>
            </header>
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dir={isRTL ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Simple markdown parser
function parseMarkdown(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Lists
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="mb-4">')
    // Wrap in paragraph
    .replace(/^(.*)$/gm, (match, p1) => {
      if (p1.startsWith('<')) return p1;
      return `<p class="mb-4">${p1}</p>`;
    });
}
