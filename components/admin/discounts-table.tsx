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
import { Edit, Percent, DollarSign } from "lucide-react";

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  descriptionEn: string;
  usedCount: number;
  maxUses: number | null;
  isActive: boolean;
  validUntil: string;
}

interface DiscountsTableProps {
  discounts: Discount[];
}

export function DiscountsTable({ discounts }: DiscountsTableProps) {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-SA", {
      dateStyle: "medium",
    }).format(new Date(dateString));
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Discount Codes ({discounts.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {discounts.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No discount codes yet
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-mono font-bold">
                    {discount.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {discount.type === "PERCENTAGE" ? (
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      )}
                      {discount.type === "PERCENTAGE" ? "Percentage" : "Fixed"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {discount.type === "PERCENTAGE"
                      ? `${discount.value}%`
                      : `${discount.value} SAR`}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {discount.descriptionEn}
                  </TableCell>
                  <TableCell>
                    {discount.usedCount} / {discount.maxUses || "∞"}
                  </TableCell>
                  <TableCell>
                    {!discount.isActive ? (
                      <Badge variant="outline">Inactive</Badge>
                    ) : isExpired(discount.validUntil) ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge className="bg-secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(discount.validUntil)}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/discounts/${discount.id}`}>
                        <Edit className="h-4 w-4" />
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
