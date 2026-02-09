import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { Header, Footer } from "@/components/layout";
import { AccountDashboard } from "@/components/account/account-dashboard";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models";
import { User } from "@/lib/models/User";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getUserOrders(userId: string) {
  await connectDB();
  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(orders));
}

async function getUserFromDatabase(email: string) {
  await connectDB();
  const user = await User.findOne({ email }).select("-passwordHash").lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Only allow individual users
  if (session.user.role !== "INDIVIDUAL") {
    redirect(`/${locale}/institutions/dashboard`);
  }

  // Fetch fresh user data from database (not from session)
  const dbUser = await getUserFromDatabase(session.user.email);
  
  if (!dbUser) {
    redirect(`/${locale}/login`);
  }

  const orders = await getUserOrders(dbUser._id.toString());
  const t = await getTranslations("account");

  // Merge session info with fresh database data
  const userData = {
    id: dbUser._id.toString(),
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    role: session.user.role,
  };

  const isRTL = locale === "ar";

  return (
    <div className="flex min-h-screen flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t("welcome", { name: userData.name })}</h1>
            <p className="text-muted-foreground mt-2">{t("dashboardDescription")}</p>
          </div>
          <AccountDashboard user={userData} orders={orders} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
