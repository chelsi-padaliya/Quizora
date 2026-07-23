"use client";

import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";

interface DashboardShellProps {
  user?: { name?: string | null; email?: string | null; role?: string };
  isAdmin?: boolean;
  children: React.ReactNode;
}

const SIDEBAR_KEY = "sidebar-collapsed";

export function DashboardShell({ user, isAdmin = false, children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar
        user={user}
        isAdmin={isAdmin}
        onMenuClick={() => setMobileOpen(true)}
      />
      <MobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        isAdmin={isAdmin}
      />
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <Sidebar
          collapsed={mounted ? collapsed : false}
          onToggleCollapse={toggleCollapsed}
          isAdmin={isAdmin}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
