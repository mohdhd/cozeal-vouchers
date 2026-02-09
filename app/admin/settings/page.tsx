import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Settings } from "@/lib/models";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  await dbConnect();
  const settings = await Settings.find().lean();
  const settingsMap = Object.fromEntries(
    settings.map((s) => [s.key, s.value])
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/20 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure pricing and company information
          </p>
        </div>

        <SettingsForm
          initialData={{
            voucherBasePrice: settingsMap.voucher_base_price || "1350",
            vatPercentage: settingsMap.vat_percentage || "15",
            companyNameEn: settingsMap.company_name_en || "Cozeal",
            companyNameAr: settingsMap.company_name_ar || "كوزيل",
            companyVatNumber: settingsMap.company_vat_number || "",
            companyCrNumber: settingsMap.company_cr_number || "",
          }}
        />
      </main>
    </div>
  );
}
