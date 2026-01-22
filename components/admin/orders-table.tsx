"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  universityName: string;
  contactName: string;
  email: string;
  phone: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-SA", {
      style: "decimal",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-secondary">Paid</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>;
      case "REFUNDED":
        return <Badge variant="destructive">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No orders yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>University</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.universityName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{order.contactName}</p>
                      <p className="text-muted-foreground">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    {formatCurrency(order.totalAmount)} SAR
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
