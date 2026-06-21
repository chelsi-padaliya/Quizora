"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { ADMIN_NAV_ITEMS, MAIN_NAV_ITEMS } from "@/constants/navigation";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
}

export function MobileSidebar({ open, onOpenChange, isAdmin }: MobileSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== ROUTES.dashboard && pathname.startsWith(href + "/"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 top-0 h-full max-w-xs translate-x-0 translate-y-0 rounded-none border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Navigation</DialogTitle>
        </DialogHeader>
        <nav className="space-y-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {isAdmin && (
          <div className="border-t pt-4">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            <nav className="space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
