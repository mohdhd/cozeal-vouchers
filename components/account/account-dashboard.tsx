"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingBag,
  User,
  Settings,
  LogOut,
  Package,
  Clock,
  CheckCircle,
  ExternalLink,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  fulfillmentStatus: string;
  totalAmount: number;
  quantity: number;
  createdAt: string;
}

interface AccountDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  orders: Order[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const fulfillmentStatusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PENDING_REVIEW: "bg-blue-100 text-blue-800",
  IN_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  VOUCHERS_ASSIGNED: "bg-green-100 text-green-800",
  DELIVERED: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export function AccountDashboard({ user, orders }: AccountDashboardProps) {
  const locale = useLocale();
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const isRTL = locale === "ar";

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: user.name,
    phone: user.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: false,
  });

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch notification settings when dialog opens
  useEffect(() => {
    if (notificationsOpen) {
      const fetchNotifications = async () => {
        setLoadingNotifications(true);
        try {
          const res = await fetch("/api/account/notifications");
          const data = await res.json();
          if (data.success && data.preferences) {
            setNotifications({
              orderUpdates: data.preferences.orderUpdates ?? true,
              promotions: data.preferences.promotions ?? false,
              newsletter: data.preferences.newsletter ?? false,
            });
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        } finally {
          setLoadingNotifications(false);
        }
      };
      fetchNotifications();
    }
  }, [notificationsOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error(isRTL ? "الاسم مطلوب" : "Name is required");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success(isRTL ? "تم تحديث الملف الشخصي" : "Profile updated successfully");
      setEditProfileOpen(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch {
      toast.error(isRTL ? "فشل تحديث الملف الشخصي" : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error(isRTL ? "جميع الحقول مطلوبة" : "All fields are required");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error(isRTL ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      toast.success(isRTL ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully");
      setChangePasswordOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (isRTL ? "فشل تغيير كلمة المرور" : "Failed to change password"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    try {
      const res = await fetch("/api/account/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      if (!res.ok) throw new Error("Failed to save notifications");

      toast.success(isRTL ? "تم حفظ إعدادات الإشعارات" : "Notification settings saved");
      setNotificationsOpen(false);
    } catch {
      toast.error(isRTL ? "فشل حفظ الإعدادات" : "Failed to save settings");
    } finally {
      setSavingNotifications(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale === "ar" ? "ar-SA" : "en-US") + " " + t("sar");
  };

  // Stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "PAID").length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalOrders")}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("completedOrders")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pendingOrders")}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            {t("orders")}
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            {t("profile")}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {t("settings")}
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{t("orderHistory")}</CardTitle>
              <CardDescription>{t("orderHistoryDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">{t("noOrders")}</h3>
                  <p className="text-muted-foreground">{t("noOrdersDescription")}</p>
                  <Link href="/certificates">
                    <Button className="mt-4">{t("browseCertificates")}</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("orderNumber")}</TableHead>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>{t("quantity")}</TableHead>
                      <TableHead>{t("total")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("fulfillment")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[order.status] || ""}>
                            {t(`orderStatus.${order.status.toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={fulfillmentStatusColors[order.fulfillmentStatus] || ""}>
                            {t(`fulfillmentStatus.${order.fulfillmentStatus.toLowerCase()}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/account/orders/${order._id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("profileInformation")}</CardTitle>
              <CardDescription>{t("profileDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t("fullName")}</Label>
                  <p className="text-lg">{user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">{t("email")}</Label>
                  <p className="text-lg">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setEditProfileOpen(true)}>
                {t("editProfile")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("accountSettings")}</CardTitle>
              <CardDescription>{t("settingsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{t("changePassword")}</h4>
                  <p className="text-sm text-muted-foreground">{t("changePasswordDescription")}</p>
                </div>
                <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                  {t("change")}
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{t("notifications")}</h4>
                  <p className="text-sm text-muted-foreground">{t("notificationsDescription")}</p>
                </div>
                <Button variant="outline" onClick={() => setNotificationsOpen(true)}>
                  {t("manage")}
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                <div>
                  <h4 className="font-medium text-red-700">{t("signOut")}</h4>
                  <p className="text-sm text-red-600">{t("signOutDescription")}</p>
                </div>
                <Button variant="destructive" onClick={handleSignOut}>
                  <LogOut className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("signOut")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("editProfile")}</DialogTitle>
            <DialogDescription>
              {isRTL ? "قم بتحديث معلوماتك الشخصية" : "Update your personal information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{isRTL ? "رقم الهاتف" : "Phone Number"}</Label>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                {isRTL ? "لا يمكن تغيير البريد الإلكتروني" : "Email cannot be changed"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile && <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />}
              {isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("changePassword")}</DialogTitle>
            <DialogDescription>
              {isRTL ? "أدخل كلمة المرور الحالية والجديدة" : "Enter your current and new password"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {isRTL ? "كلمة المرور الحالية" : "Current Password"}
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">
                {isRTL ? "كلمة المرور الجديدة" : "New Password"}
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {tAuth("passwordRequirements")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword && <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />}
              {t("change")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>{t("notifications")}</DialogTitle>
            <DialogDescription>
              {isRTL ? "إدارة تفضيلات الإشعارات" : "Manage your notification preferences"}
            </DialogDescription>
          </DialogHeader>
          {loadingNotifications ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isRTL ? "تحديثات الطلبات" : "Order Updates"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "إشعارات حول حالة طلباتك" : "Notifications about your order status"}
                </p>
              </div>
              <Switch
                checked={notifications.orderUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isRTL ? "العروض والخصومات" : "Promotions & Discounts"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "إشعارات حول العروض الخاصة" : "Notifications about special offers"}
                </p>
              </div>
              <Switch
                checked={notifications.promotions}
                onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {isRTL ? "النشرة الإخبارية" : "Newsletter"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "نصائح ومقالات حول شهادات CompTIA" : "Tips and articles about CompTIA certifications"}
                </p>
              </div>
              <Switch
                checked={notifications.newsletter}
                onCheckedChange={(checked) => setNotifications({ ...notifications, newsletter: checked })}
              />
            </div>
          </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotificationsOpen(false)}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleSaveNotifications} disabled={savingNotifications}>
              {savingNotifications && <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? "ml-2" : "mr-2"}`} />}
              {isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
