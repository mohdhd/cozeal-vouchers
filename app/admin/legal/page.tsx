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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  Plus,
  Pencil,
  Eye,
  ExternalLink,
} from "lucide-react";

interface LegalPage {
  _id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  isPublished: boolean;
  updatedAt: string;
}

const defaultPages = [
  { slug: "terms-of-service", titleEn: "Terms of Service", titleAr: "الشروط والأحكام" },
  { slug: "terms-of-sale", titleEn: "Terms of Sale", titleAr: "شروط البيع" },
  { slug: "privacy-policy", titleEn: "Privacy Policy", titleAr: "سياسة الخصوصية" },
  { slug: "refund-policy", titleEn: "Refund Policy", titleAr: "سياسة الاسترداد" },
  { slug: "cookie-policy", titleEn: "Cookie Policy", titleAr: "سياسة ملفات تعريف الارتباط" },
];

export default function AdminLegalPage() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<LegalPage | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<LegalPage>>({});
  const [previewLang, setPreviewLang] = useState<"en" | "ar">("en");

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/legal");
      const data = await res.json();

      if (data.success) {
        setPages(data.pages);
      }
    } catch (error) {
      toast.error("Failed to fetch legal pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleTogglePublished = async (pageId: string, currentPublished: boolean) => {
    try {
      const page = pages.find((p) => p._id === pageId);
      if (!page) return;

      const res = await fetch(`/api/admin/legal/${page.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentPublished }),
      });

      if (!res.ok) throw new Error("Failed to update page");

      toast.success(currentPublished ? "Page unpublished" : "Page published");
      fetchPages();
    } catch (error) {
      toast.error("Failed to update page");
    }
  };

  const handleSave = async () => {
    setActionLoading(true);
    try {
      const isNew = !selectedPage;
      const slug = formData.slug || selectedPage?.slug;
      const url = isNew ? "/api/admin/legal" : `/api/admin/legal/${slug}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save page");

      toast.success(isNew ? "Page created" : "Page updated");
      setIsEditDialogOpen(false);
      fetchPages();
    } catch (error) {
      toast.error("Failed to save page");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (page: LegalPage) => {
    setSelectedPage(page);
    setFormData(page);
    setIsEditDialogOpen(true);
  };

  const openAddDialog = (template?: { slug: string; titleEn: string; titleAr: string }) => {
    setSelectedPage(null);
    setFormData({
      slug: template?.slug || "",
      titleEn: template?.titleEn || "",
      titleAr: template?.titleAr || "",
      contentEn: "",
      contentAr: "",
      isPublished: false,
    });
    setIsEditDialogOpen(true);
  };

  const handleFormChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check which default pages are missing
  const missingPages = defaultPages.filter(
    (dp) => !pages.some((p) => p.slug === dp.slug)
  );

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Legal Pages</h1>
              <p className="text-muted-foreground">
                Manage legal content for Saudi compliance
              </p>
            </div>
            <Button onClick={() => openAddDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </div>

          {/* Missing Pages Alert */}
          {missingPages.length > 0 && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-yellow-800">Missing Required Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-700 mb-4">
                  The following pages are required for Saudi e-commerce compliance:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingPages.map((mp) => (
                    <Button
                      key={mp.slug}
                      variant="outline"
                      size="sm"
                      onClick={() => openAddDialog(mp)}
                      className="border-yellow-400 text-yellow-800 hover:bg-yellow-100"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {mp.titleEn}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No legal pages yet</h3>
                  <p className="text-muted-foreground">Create your first legal page</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{page.titleEn}</p>
                            <p className="text-sm text-muted-foreground" dir="rtl">
                              {page.titleAr}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {page.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={page.isPublished}
                            onCheckedChange={() =>
                              handleTogglePublished(page._id, page.isPublished)
                            }
                          />
                        </TableCell>
                        <TableCell>{formatDate(page.updatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(page)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {page.isPublished && (
                              <a
                                href={`/en/legal/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                          </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPage ? "Edit Legal Page" : "Create Legal Page"}
            </DialogTitle>
            <DialogDescription>
              Content supports basic Markdown formatting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug || ""}
                  onChange={(e) => handleFormChange("slug", e.target.value.toLowerCase())}
                  placeholder="privacy-policy"
                  disabled={!!selectedPage}
                />
              </div>
              <div className="space-y-2">
                <Label>Published</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.isPublished || false}
                    onCheckedChange={(checked) => handleFormChange("isPublished", checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.isPublished ? "Visible to public" : "Hidden from public"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title (English)</Label>
                <Input
                  value={formData.titleEn || ""}
                  onChange={(e) => handleFormChange("titleEn", e.target.value)}
                  placeholder="Privacy Policy"
                />
              </div>
              <div className="space-y-2">
                <Label>Title (Arabic)</Label>
                <Input
                  value={formData.titleAr || ""}
                  onChange={(e) => handleFormChange("titleAr", e.target.value)}
                  placeholder="سياسة الخصوصية"
                  dir="rtl"
                />
              </div>
            </div>

            <Tabs defaultValue="en" className="w-full">
              <TabsList>
                <TabsTrigger value="en">English Content</TabsTrigger>
                <TabsTrigger value="ar">Arabic Content</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="en" className="space-y-2">
                <Label>Content (English)</Label>
                <textarea
                  className="w-full min-h-[300px] p-3 border rounded-md font-mono text-sm"
                  value={formData.contentEn || ""}
                  onChange={(e) => handleFormChange("contentEn", e.target.value)}
                  placeholder="# Privacy Policy&#10;&#10;Your content here..."
                />
              </TabsContent>
              <TabsContent value="ar" className="space-y-2">
                <Label>Content (Arabic)</Label>
                <textarea
                  className="w-full min-h-[300px] p-3 border rounded-md font-mono text-sm"
                  value={formData.contentAr || ""}
                  onChange={(e) => handleFormChange("contentAr", e.target.value)}
                  dir="rtl"
                  placeholder="# سياسة الخصوصية&#10;&#10;المحتوى هنا..."
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={previewLang === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewLang("en")}
                  >
                    English
                  </Button>
                  <Button
                    variant={previewLang === "ar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewLang("ar")}
                  >
                    العربية
                  </Button>
                </div>
                <div
                  className="prose max-w-none p-4 border rounded-md min-h-[300px]"
                  dir={previewLang === "ar" ? "rtl" : "ltr"}
                  dangerouslySetInnerHTML={{
                    __html: parseMarkdown(
                      previewLang === "ar"
                        ? formData.contentAr || ""
                        : formData.contentEn || ""
                    ),
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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

// Simple markdown parser
function parseMarkdown(content: string): string {
  if (!content) return "";
  return content
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gim, "<em>$1</em>")
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4">');
}
