import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Order } from "@/lib/models";
import { AdminSidebar } from "@/components/admin/sidebar";
import { OrdersTable } from "@/components/admin/orders-table";

export default async function OrdersPage() {
  const session = await auth();

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/admin/login");
  }

  await dbConnect();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-muted/20 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage all orders</p>
        </div>

        <OrdersTable
          orders={orders.map((order) => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            universityName: order.customerName,
            contactName: order.contactName,
            email: order.email,
            phone: order.phone,
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
