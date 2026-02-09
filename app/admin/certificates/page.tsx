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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Search,
  Award,
  Loader2,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  GripVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Certificate {
  _id: string;
  code: string;
  slug: string;
  category: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  examCode: string;
  examCodes: string[];
  numberOfExams: number;
  retailPrice: number;
  institutionBasePrice: number;
  validityMonths: number;
  isActive: boolean;
  sortOrder: number;
  featuresEn: string[];
  featuresAr: string[];
}

const categoryColors: Record<string, string> = {
  CORE: "bg-blue-100 text-blue-800",
  INFRASTRUCTURE: "bg-green-100 text-green-800",
  CYBERSECURITY: "bg-red-100 text-red-800",
  DATA: "bg-purple-100 text-purple-800",
  PROFESSIONAL: "bg-orange-100 text-orange-800",
};

const categories = [
  { value: "CORE", label: "Core" },
  { value: "INFRASTRUCTURE", label: "Infrastructure" },
  { value: "CYBERSECURITY", label: "Cybersecurity" },
  { value: "DATA", label: "Data" },
  { value: "PROFESSIONAL", label: "Professional" },
];

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Certificate>>({});

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/certificates");
      const data = await res.json();

      if (data.success) {
        setCertificates(data.certificates);
      }
    } catch (error) {
      toast.error("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleToggleActive = async (certId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/certificates/${certId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      if (!res.ok) throw new Error("Failed to update certificate");

      toast.success(currentActive ? "Certificate disabled" : "Certificate enabled");
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to update certificate");
    }
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const isNew = !selectedCert;
      const url = isNew
        ? "/api/admin/certificates"
        : `/api/admin/certificates/${selectedCert._id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save certificate");

      toast.success(isNew ? "Certificate created" : "Certificate updated");
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      setFormData({});
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to save certificate");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (cert: Certificate) => {
    setSelectedCert(cert);
    setFormData(cert);
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedCert(null);
    setFormData({
      category: "CORE",
      numberOfExams: 1,
      validityMonths: 12,
      isActive: true,
      sortOrder: certificates.length + 1,
      featuresEn: [],
      featuresAr: [],
      examCodes: [],
    });
    setIsAddDialogOpen(true);
  };

  const handleFormChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      cert.code.toLowerCase().includes(search.toLowerCase()) ||
      cert.examCode.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + " SAR";
  };

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Certificate Management</h1>
              <p className="text-muted-foreground">Manage CompTIA certification catalog</p>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-5 mb-8">
            {categories.map((cat) => (
              <Card key={cat.value}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{cat.label}</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {certificates.filter((c) => c.category === cat.value).length}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by name, code, or exam code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredCertificates.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No certificates found</h3>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Exam Code</TableHead>
                      <TableHead>Retail Price</TableHead>
                      <TableHead>Institution Price</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.map((cert) => (
                      <TableRow key={cert._id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.nameEn}</p>
                            <p className="text-sm text-muted-foreground">{cert.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={categoryColors[cert.category]}>
                            {cert.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{cert.examCode}</p>
                            {cert.numberOfExams > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {cert.numberOfExams} exams
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(cert.retailPrice)}</TableCell>
                        <TableCell>{formatCurrency(cert.institutionBasePrice)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={cert.isActive}
                            onCheckedChange={() => handleToggleActive(cert._id, cert.isActive)}
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(cert)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
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

      {/* Edit/Add Dialog */}
      <Dialog
        open={isEditDialogOpen || isAddDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditDialogOpen(false);
            setIsAddDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isAddDialogOpen ? "Add Certificate" : "Edit Certificate"}
            </DialogTitle>
            <DialogDescription>
              {isAddDialogOpen
                ? "Add a new CompTIA certification to the catalog"
                : `Update ${selectedCert?.nameEn}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={formData.code || ""}
                  onChange={(e) => handleFormChange("code", e.target.value.toUpperCase())}
                  placeholder="SECURITY_PLUS"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug || ""}
                  onChange={(e) => handleFormChange("slug", e.target.value.toLowerCase())}
                  placeholder="security-plus"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input
                  value={formData.nameEn || ""}
                  onChange={(e) => handleFormChange("nameEn", e.target.value)}
                  placeholder="CompTIA Security+"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Arabic)</Label>
                <Input
                  value={formData.nameAr || ""}
                  onChange={(e) => handleFormChange("nameAr", e.target.value)}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category || "CORE"}
                onValueChange={(value) => handleFormChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Exam Code</Label>
                <Input
                  value={formData.examCode || ""}
                  onChange={(e) => handleFormChange("examCode", e.target.value)}
                  placeholder="SY0-701"
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Exams</Label>
                <Input
                  type="number"
                  value={formData.numberOfExams || 1}
                  onChange={(e) => handleFormChange("numberOfExams", parseInt(e.target.value))}
                  min={1}
                  max={5}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Retail Price (SAR)</Label>
                <Input
                  type="number"
                  value={formData.retailPrice || ""}
                  onChange={(e) => handleFormChange("retailPrice", parseFloat(e.target.value))}
                  placeholder="1450"
                />
              </div>
              <div className="space-y-2">
                <Label>Institution Base Price (SAR)</Label>
                <Input
                  type="number"
                  value={formData.institutionBasePrice || ""}
                  onChange={(e) =>
                    handleFormChange("institutionBasePrice", parseFloat(e.target.value))
                  }
                  placeholder="1350"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (English)</Label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={formData.descriptionEn || ""}
                onChange={(e) => handleFormChange("descriptionEn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Arabic)</Label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={formData.descriptionAr || ""}
                onChange={(e) => handleFormChange("descriptionAr", e.target.value)}
                dir="rtl"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Validity (Months)</Label>
                <Input
                  type="number"
                  value={formData.validityMonths || 12}
                  onChange={(e) => handleFormChange("validityMonths", parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sortOrder || 0}
                  onChange={(e) => handleFormChange("sortOrder", parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setIsAddDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
