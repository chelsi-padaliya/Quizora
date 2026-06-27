"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageItems(page: number, totalPages: number): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageItems = getPageItems(page, totalPages);

  return (
    <div className={cn("flex justify-end", className)}>
      <div className="flex items-center gap-1 rounded-lg border bg-card p-2 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageItems.map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center text-sm font-medium text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              variant={item === page ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Page ${item}`}
            >
              {item}
            </Button>
          )
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
