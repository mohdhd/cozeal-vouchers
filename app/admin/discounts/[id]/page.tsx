import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DiscountCode } from "@/lib/models";
import { AdminSidebar } from "@/components/admin/sidebar";
import { DiscountForm } from "@/components/admin/discount-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditDiscountPage({ params }: Props) {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  const { id } = await params;
  
  await dbConnect();
  
  const discount = await DiscountCode.findById(id).lean();
  
  if (!discount) {
    notFound();
  }

  const initialData = {
    id: (discount._id as any).toString(),
    code: discount.code,
    type: discount.type,
    value: discount.value,
    descriptionEn: discount.descriptionEn,
    descriptionAr: discount.descriptionAr,
    minQuantity: discount.minQuantity || null,
    maxUses: discount.maxUses || null,
    validFrom: discount.validFrom.toISOString(),
    validUntil: discount.validUntil.toISOString(),
    universityRestriction: discount.universityRestriction || null,
    isActive: discount.isActive,
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/20 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Discount Code</h1>
          <p className="text-muted-foreground">Update discount code: {discount.code}</p>
        </div>

        <DiscountForm initialData={initialData} />
      </main>
    </div>
  );
}
