import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order, DiscountCode } from "@/lib/models";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  await dbConnect();

  const [
    totalOrders,
    paidOrders,
    pendingOrders,
    activeDiscounts,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "PAID" }),
    Order.countDocuments({ status: "PENDING" }),
    DiscountCode.countDocuments({ isActive: true }),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const revenueResult = await Order.aggregate([
    { $match: { status: "PAID" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/20 p-8">
        <AdminDashboard
          stats={{
            totalOrders,
            paidOrders,
            pendingOrders,
            activeDiscounts,
            totalRevenue,
          }}
          recentOrders={recentOrders.map((order) => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            universityName: order.universityName,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt.toISOString(),
          }))}
          userName={session.user?.name || "Admin"}
        />
      </main>
    </div>
  );
}
