import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { DiscountForm } from "@/components/admin/discount-form";

export default async function NewDiscountPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/20 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Discount Code</h1>
          <p className="text-muted-foreground">Create a new discount code</p>
        </div>

        <DiscountForm />
      </main>
    </div>
  );
}
