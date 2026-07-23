"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { ADMIN_NAV_ITEMS, MAIN_NAV_ITEMS } from "@/constants/navigation";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isAdmin?: boolean;
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 border-l-2 px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggleCollapse, isAdmin }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== ROUTES.dashboard && pathname.startsWith(href + "/"));

  return (
    <aside
      className={cn(
        "hidden h-full min-h-0 shrink-0 overflow-hidden border-r bg-card lg:flex lg:flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1 p-4">
            {MAIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.href)}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {isAdmin && (
            <div className="border-t px-4 py-3">
              {!collapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </p>
              )}
              <div className="space-y-1">
                {ADMIN_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive(item.href)}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full", collapsed && "px-0")}
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
