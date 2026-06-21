"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: FilterOption[];
  placeholder?: string;
  allLabel?: string;
  className?: string;
}

export function FilterDropdown({
  value,
  onChange,
  options,
  placeholder = "Filter",
  allLabel = "All",
  className,
}: FilterDropdownProps) {
  return (
    <Select
      value={value ?? "all"}
      onValueChange={(v) => onChange(v === "all" ? undefined : v)}
    >
      <SelectTrigger className={cn("w-[160px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
