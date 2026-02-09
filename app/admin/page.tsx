import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order, DiscountCode, User, Institution, Voucher, Certificate } from "@/lib/models";
import { AdminDashboard } from "@/components/admin/dashboard";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  await dbConnect();

  const [
    totalOrders,
    paidOrders,
    pendingOrders,
    activeDiscounts,
    recentOrders,
    totalUsers,
    totalInstitutions,
    pendingInstitutions,
    availableVouchers,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: "PAID" }),
    Order.countDocuments({ status: "PENDING" }),
    DiscountCode.countDocuments({ isActive: true }),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.countDocuments({ role: { $ne: "ADMIN" } }),
    Institution.countDocuments(),
    Institution.countDocuments({ status: "PENDING" }),
    Voucher.countDocuments({ status: "AVAILABLE" }),
  ]);

  // Check for low stock certificates
  const certificates = await Certificate.find({ isActive: true }).lean();
  let lowStockCertificates = 0;
  for (const cert of certificates) {
    const count = await Voucher.countDocuments({ 
      certificateId: cert._id, 
      status: "AVAILABLE" 
    });
    if (count < 10) lowStockCertificates++;
  }

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
            totalUsers,
            totalInstitutions,
            pendingInstitutions,
            availableVouchers,
            lowStockCertificates,
          }}
          recentOrders={recentOrders.map((order: any) => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            customerName: order.customerName || order.universityName || "Unknown",
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
