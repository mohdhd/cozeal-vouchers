"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search,
  Package,
  Loader2,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";

interface VoucherStats {
  total: number;
  available: number;
  reserved: number;
  assigned: number;
  delivered: number;
  used: number;
  expired: number;
}

interface Voucher {
  _id: string;
  code: string;
  certificateId: {
    _id: string;
    nameEn: string;
    code: string;
  };
  status: string;
  batchId?: string;
  expiresAt: string;
  assignedToOrderId?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  RESERVED: "bg-yellow-100 text-yellow-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-purple-100 text-purple-800",
  USED: "bg-gray-100 text-gray-800",
  EXPIRED: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, React.ElementType> = {
  AVAILABLE: CheckCircle,
  RESERVED: Clock,
  ASSIGNED: Package,
  DELIVERED: CheckCircle,
  USED: CheckCircle,
  EXPIRED: XCircle,
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<VoucherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [certificateFilter, setCertificateFilter] = useState<string>("ALL");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/vouchers/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.totals);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      if (certificateFilter && certificateFilter !== "ALL") params.set("certificateId", certificateFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/vouchers?${params}`);
      const data = await res.json();

      if (data.success) {
        setVouchers(data.vouchers);
      }
    } catch (error) {
      toast.error("Failed to fetch vouchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchVouchers();
  }, [statusFilter, certificateFilter]);

  const handleSearch = () => {
    fetchVouchers();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const maskCode = (code: string) => {
    if (code.length <= 8) return code;
    return code.substring(0, 4) + "****" + code.substring(code.length - 4);
  };

  const isExpiringSoon = (dateStr: string) => {
    const expiresAt = new Date(dateStr);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Voucher Inventory</h1>
              <p className="text-muted-foreground">Manage and track exam voucher inventory</p>
            </div>
            <Button onClick={() => window.location.href = "/admin/vouchers/import"}>
              <Upload className="h-4 w-4 mr-2" />
              Import Vouchers
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-7 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Available</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-800">{stats.available}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reserved</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.reserved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned</CardTitle>
                  <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.assigned}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.delivered}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Used</CardTitle>
                  <CheckCircle className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.used}</div>
                </CardContent>
              </Card>
              <Card className={stats.expired > 0 ? "border-red-200 bg-red-50" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`text-sm font-medium ${stats.expired > 0 ? "text-red-800" : ""}`}>
                    Expired
                  </CardTitle>
                  <XCircle className={`h-4 w-4 ${stats.expired > 0 ? "text-red-600" : "text-gray-400"}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.expired > 0 ? "text-red-800" : ""}`}>
                    {stats.expired}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Low Stock Alert */}
          {stats && stats.available < 10 && (
            <Card className="mb-8 border-yellow-300 bg-yellow-50">
              <CardContent className="flex items-center gap-4 py-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Low Stock Alert</p>
                  <p className="text-sm text-yellow-700">
                    Only {stats.available} vouchers available. Consider importing more vouchers.
                  </p>
                </div>
                <Button variant="outline" className="ml-auto" onClick={() => window.location.href = "/admin/vouchers/import"}>
                  Import Now
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by voucher code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="USED">Used</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : vouchers.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No vouchers found</h3>
                  <p className="text-muted-foreground">Import vouchers to get started</p>
                  <Button className="mt-4" onClick={() => window.location.href = "/admin/vouchers/import"}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Vouchers
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Voucher Code</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers.map((voucher) => {
                      const StatusIcon = statusIcons[voucher.status] || Package;
                      return (
                        <TableRow key={voucher._id}>
                          <TableCell className="font-mono">{maskCode(voucher.code)}</TableCell>
                          <TableCell>
                            {voucher.certificateId?.nameEn || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[voucher.status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {voucher.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {voucher.batchId ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {voucher.batchId}
                              </code>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={isExpiringSoon(voucher.expiresAt) ? "text-yellow-600 font-medium" : ""}>
                              {formatDate(voucher.expiresAt)}
                              {isExpiringSoon(voucher.expiresAt) && (
                                <AlertTriangle className="h-3 w-3 inline ml-1 text-yellow-600" />
                              )}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(voucher.createdAt)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
