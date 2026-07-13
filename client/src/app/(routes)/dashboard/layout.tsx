"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Sidebar } from "@/components/dashboard/Sidebar";

function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-sand">
      <Navbar />
      <div className="flex min-h-[calc(100vh-72px)] flex-1 items-start gap-5 px-4 py-4 sm:px-5">
        <Sidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
