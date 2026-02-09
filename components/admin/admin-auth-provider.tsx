"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Allow access to login page without authentication
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (status === "loading") return;
    if (isLoginPage) return;

    // If not authenticated or not an admin, redirect to admin login
    if (!session || session.user?.role !== "ADMIN") {
      router.replace("/admin/login");
    }
  }, [session, status, router, isLoginPage]);

  // If on login page, render immediately
  if (isLoginPage) {
    // If already logged in as admin, redirect to dashboard
    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      router.replace("/admin");
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return <>{children}</>;
  }

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render children if not an admin
  if (!session || session.user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
