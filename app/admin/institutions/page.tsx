"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Loader2,
  Eye,
  MoreHorizontal,
  BadgePercent,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Institution {
  _id: string;
  nameEn: string;
  nameAr: string;
  type: string;
  email: string;
  phone: string;
  status: string;
  vatNumber?: string;
  crNumber?: string;
  city?: string;
  discountType?: string;
  discountValue?: number;
  createdAt: string;
  contact?: {
    name: string;
    email: string;
    phone?: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SUSPENDED: "bg-gray-100 text-gray-800",
};

const typeLabels: Record<string, string> = {
  UNIVERSITY: "University",
  COMPANY: "Company",
  TRAINING_CENTER: "Training Center",
  GOVERNMENT: "Government",
  OTHER: "Other",
};

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [discountType, setDiscountType] = useState<string>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/institutions?${params}`);
      const data = await res.json();

      if (data.success) {
        setInstitutions(data.institutions);
      }
    } catch (error) {
      toast.error("Failed to fetch institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchInstitutions();
  };

  const handleApprove = async () => {
    if (!selectedInstitution) return;
    setActionLoading(true);

    try {
      // If institution is pending, approve first
      if (selectedInstitution.status === "PENDING") {
        const approveRes = await fetch(`/api/admin/institutions/${selectedInstitution._id}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: "en" }),
        });

        if (!approveRes.ok) {
          throw new Error("Failed to approve");
        }
      }

      // Set/update discount if provided
      if (discountValue) {
        const discountRes = await fetch(`/api/admin/institutions/${selectedInstitution._id}/discount`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discountType,
            discountValue: parseFloat(discountValue),
          }),
        });

        if (!discountRes.ok) {
          throw new Error("Failed to set discount");
        }
      }

      toast.success(
        selectedInstitution.status === "PENDING"
          ? "Institution approved successfully"
          : "Discount updated successfully"
      );
      setIsApproveDialogOpen(false);
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      fetchInstitutions();
    } catch (error) {
      toast.error(
        selectedInstitution.status === "PENDING"
          ? "Failed to approve institution"
          : "Failed to update discount"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedInstitution || !rejectionReason.trim()) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/institutions/${selectedInstitution._id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason, locale: "en" }),
      });

      if (!res.ok) {
        throw new Error("Failed to reject");
      }

      toast.success("Institution rejected");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      fetchInstitutions();
    } catch (error) {
      toast.error("Failed to reject institution");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const pendingCount = institutions.filter((i) => i.status === "PENDING").length;

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Institution Management</h1>
              <p className="text-muted-foreground">Manage institution registrations and approvals</p>
            </div>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {pendingCount} Pending Approval
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {institutions.filter((i) => i.status === "PENDING").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {institutions.filter((i) => i.status === "APPROVED").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {institutions.filter((i) => i.status === "REJECTED").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{institutions.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="PENDING">Pending</TabsTrigger>
                <TabsTrigger value="APPROVED">Approved</TabsTrigger>
                <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
                <TabsTrigger value="ALL">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : institutions.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No institutions found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {institutions.map((inst) => (
                      <TableRow key={inst._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{inst.nameEn}</p>
                            <p className="text-sm text-muted-foreground">{inst.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{typeLabels[inst.type] || inst.type}</TableCell>
                        <TableCell>
                          {inst.contact ? (
                            <div>
                              <p className="text-sm">{inst.contact.name}</p>
                              <p className="text-xs text-muted-foreground">{inst.contact.email}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {inst.discountValue ? (
                            <Badge variant="secondary">
                              {inst.discountType === "PERCENTAGE"
                                ? `${inst.discountValue}%`
                                : `${inst.discountValue} SAR`}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[inst.status]}>{inst.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(inst.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedInstitution(inst);
                                  setIsDetailDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {inst.status === "PENDING" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedInstitution(inst);
                                      setIsApproveDialogOpen(true);
                                    }}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedInstitution(inst);
                                      setIsRejectDialogOpen(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {inst.status === "APPROVED" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedInstitution(inst);
                                      setDiscountType(inst.discountType || "PERCENTAGE");
                                      setDiscountValue(inst.discountValue?.toString() || "");
                                      setIsApproveDialogOpen(true);
                                    }}
                                  >
                                    <BadgePercent className="h-4 w-4 mr-2" />
                                    Edit Discount
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedInstitution?.status === "APPROVED" ? "Edit Discount" : "Approve Institution"}
            </DialogTitle>
            <DialogDescription>
              {selectedInstitution?.status === "APPROVED"
                ? `Update discount for ${selectedInstitution?.nameEn}`
                : `Approve ${selectedInstitution?.nameEn} and optionally set a discount.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount (SAR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount Value</Label>
              <Input
                type="number"
                placeholder={discountType === "PERCENTAGE" ? "e.g., 15" : "e.g., 100"}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {discountType === "PERCENTAGE"
                  ? "Enter percentage off (e.g., 15 for 15% off)"
                  : "Enter fixed amount off per voucher in SAR"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedInstitution?.status === "APPROVED" ? "Update Discount" : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Institution</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedInstitution?.nameEn}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Input
                placeholder="Please provide a reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Institution Details</DialogTitle>
          </DialogHeader>
          {selectedInstitution && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Name (English)</Label>
                  <p className="font-medium">{selectedInstitution.nameEn}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Name (Arabic)</Label>
                  <p className="font-medium" dir="rtl">{selectedInstitution.nameAr}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p>{typeLabels[selectedInstitution.type]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={statusColors[selectedInstitution.status]}>
                    {selectedInstitution.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{selectedInstitution.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p>{selectedInstitution.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CR Number</Label>
                  <p>{selectedInstitution.crNumber || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">VAT Number</Label>
                  <p>{selectedInstitution.vatNumber || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">City</Label>
                  <p>{selectedInstitution.city || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Discount</Label>
                  <p>
                    {selectedInstitution.discountValue
                      ? `${selectedInstitution.discountValue}${
                          selectedInstitution.discountType === "PERCENTAGE" ? "%" : " SAR"
                        }`
                      : "None"}
                  </p>
                </div>
              </div>
              {selectedInstitution.contact && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Contact Person</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Name</Label>
                      <p>{selectedInstitution.contact.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p>{selectedInstitution.contact.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
