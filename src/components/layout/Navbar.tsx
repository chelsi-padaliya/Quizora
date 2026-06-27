"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, BookOpen, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "@/components/SearchBar";
import { APP_NAME, ROUTES } from "@/constants";
import { logoutAction } from "@/actions/question.actions";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface NavbarProps {
  user?: { name?: string | null; email?: string | null };
  isAdmin?: boolean;
  onMenuClick?: () => void;
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(debouncedSearch.trim())}`, {
          scroll: false,
        });
      });
    }
  }, [debouncedSearch, router]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD";

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-3 px-4 lg:gap-4 lg:px-6">
        <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link href={ROUTES.dashboard} className="flex min-w-0 items-center gap-2 font-semibold">
          <Brain className="h-6 w-6 text-primary" />
          <span className="truncate">{APP_NAME}</span>
        </Link>

        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search questions..."
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Toggle dark mode"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name ?? "Admin"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={ROUTES.dashboard}>
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.quiz}>
                  <Brain className="mr-2 h-4 w-4" />
                  Quiz Mode
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={ROUTES.theory}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Theory Mode
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logoutAction()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
