"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Download,
} from "lucide-react";

interface Certificate {
  _id: string;
  code: string;
  nameEn: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: string[];
  batchId: string;
}

export default function AdminVoucherImportPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<string>("");
  const [voucherCodes, setVoucherCodes] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [compTiaOrderRef, setCompTiaOrderRef] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/admin/certificates");
      const data = await res.json();
      if (data.success) {
        setCertificates(data.certificates);
      }
    } catch (error) {
      toast.error("Failed to fetch certificates");
    } finally {
      setLoadingCertificates(false);
    }
  };

  const parseVoucherCodes = (input: string): string[] => {
    // Split by newlines, commas, or spaces
    return input
      .split(/[\n,\s]+/)
      .map((code) => code.trim())
      .filter((code) => code.length > 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setVoucherCodes(content);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const codes = parseVoucherCodes(voucherCodes);

    if (!selectedCertificate) {
      toast.error("Please select a certificate");
      return;
    }

    if (codes.length === 0) {
      toast.error("Please enter at least one voucher code");
      return;
    }

    if (!expiresAt) {
      toast.error("Please enter an expiration date");
      return;
    }

    setLoading(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/vouchers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: selectedCertificate,
          codes,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
          expiresAt,
          compTiaOrderRef: compTiaOrderRef || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setImportResult(data);
        toast.success(`Successfully imported ${data.imported} vouchers`);
        // Clear form on success
        if (data.imported > 0 && data.errors.length === 0) {
          setVoucherCodes("");
          setCompTiaOrderRef("");
          setNotes("");
        }
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch (error) {
      toast.error("Failed to import vouchers");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = "VOUCHER-CODE-001\nVOUCHER-CODE-002\nVOUCHER-CODE-003";
    const blob = new Blob([template], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voucher-import-template.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const codesCount = parseVoucherCodes(voucherCodes).length;

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => window.location.href = "/admin/vouchers"}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vouchers
            </Button>
            <h1 className="text-3xl font-bold">Import Vouchers</h1>
            <p className="text-muted-foreground">
              Bulk import CompTIA exam voucher codes into the inventory
            </p>
          </div>

          <div className="grid gap-6">
            {/* Import Form */}
            <Card>
              <CardHeader>
                <CardTitle>Voucher Details</CardTitle>
                <CardDescription>
                  Enter the voucher codes and their details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Certificate Selection */}
                <div className="space-y-2">
                  <Label htmlFor="certificate">Certificate *</Label>
                  {loadingCertificates ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading certificates...
                    </div>
                  ) : (
                    <Select value={selectedCertificate} onValueChange={setSelectedCertificate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificates.map((cert) => (
                          <SelectItem key={cert._id} value={cert._id}>
                            {cert.nameEn} ({cert.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Voucher Codes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="codes">Voucher Codes *</Label>
                    <span className="text-sm text-muted-foreground">
                      {codesCount} code{codesCount !== 1 ? "s" : ""} detected
                    </span>
                  </div>
                  <textarea
                    id="codes"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                    placeholder="Enter voucher codes (one per line, or comma/space separated)&#10;&#10;Example:&#10;ABC123-XYZ789&#10;DEF456-UVW012&#10;GHI789-RST345"
                    value={voucherCodes}
                    onChange={(e) => setVoucherCodes(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Upload className="h-4 w-4" />
                      Upload from file
                    </Label>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".txt,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <span className="text-muted-foreground">|</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      onClick={downloadTemplate}
                    >
                      <Download className="h-4 w-4" />
                      Download template
                    </button>
                  </div>
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiration Date *</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The date when these vouchers expire (as provided by CompTIA)
                  </p>
                </div>

                {/* Purchase Price */}
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Purchase Price per Voucher (SAR)</Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 800.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your cost per voucher (for profit tracking)
                  </p>
                </div>

                {/* CompTIA Order Reference */}
                <div className="space-y-2">
                  <Label htmlFor="orderRef">CompTIA Order Reference</Label>
                  <Input
                    id="orderRef"
                    placeholder="e.g., COMP-2024-001234"
                    value={compTiaOrderRef}
                    onChange={(e) => setCompTiaOrderRef(e.target.value)}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Optional notes about this batch"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleImport}
                  disabled={loading || codesCount === 0 || !selectedCertificate || !expiresAt}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {codesCount} Voucher{codesCount !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Import Result */}
            {importResult && (
              <Card className={importResult.errors.length > 0 ? "border-yellow-300" : "border-green-300"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {importResult.errors.length === 0 ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                    Import Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{importResult.imported}</div>
                      <div className="text-sm text-green-600">Imported</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">{importResult.duplicates}</div>
                      <div className="text-sm text-yellow-600">Duplicates (skipped)</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">{importResult.errors.length}</div>
                      <div className="text-sm text-red-600">Errors</div>
                    </div>
                  </div>

                  {importResult.batchId && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Batch ID: </span>
                      <code className="bg-muted px-2 py-1 rounded">{importResult.batchId}</code>
                    </div>
                  )}

                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-red-700">Errors:</h4>
                      <ul className="text-sm text-red-600 space-y-1">
                        {importResult.errors.slice(0, 10).map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {error}
                          </li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li className="text-muted-foreground">
                            ...and {importResult.errors.length - 10} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Help Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Import Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Supported Formats</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>One voucher code per line</li>
                    <li>Comma-separated values (CSV)</li>
                    <li>Space-separated values</li>
                    <li>Text files (.txt) or CSV files (.csv)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Duplicate Handling</h4>
                  <p>
                    Voucher codes that already exist in the system will be skipped automatically.
                    The import will continue with the remaining valid codes.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Batch Tracking</h4>
                  <p>
                    Each import creates a unique batch ID for tracking purposes.
                    Use the CompTIA Order Reference field to link vouchers to your purchase orders.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
