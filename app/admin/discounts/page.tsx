import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DiscountCode } from "@/lib/models";
import { AdminSidebar } from "@/components/admin/sidebar";
import { DiscountsTable } from "@/components/admin/discounts-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DiscountsPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  await dbConnect();
  const discounts = await DiscountCode.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/20 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Discount Codes</h1>
            <p className="text-muted-foreground">Manage discount codes</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/admin/discounts/new">
              <Plus className="h-4 w-4" />
              Create New Code
            </Link>
          </Button>
        </div>

        <DiscountsTable
          discounts={discounts.map((d) => ({
            id: d._id.toString(),
            code: d.code,
            type: d.type,
            value: d.value,
            descriptionEn: d.descriptionEn,
            usedCount: d.usedCount,
            maxUses: d.maxUses ?? null,
            isActive: d.isActive,
            validUntil: d.validUntil.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
