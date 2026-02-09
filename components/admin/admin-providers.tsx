"use client";

import { SessionProvider } from "next-auth/react";
import { AdminAuthProvider } from "./admin-auth-provider";

interface AdminProvidersProps {
  children: React.ReactNode;
}

export function AdminProviders({ children }: AdminProvidersProps) {
  return (
    <SessionProvider>
      <AdminAuthProvider>{children}</AdminAuthProvider>
    </SessionProvider>
  );
}
