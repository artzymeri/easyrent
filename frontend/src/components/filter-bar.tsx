"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "boolean";
  options?: { value: string; label: string }[];
}

export interface FilterBarProps {
  filters: FilterConfig[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
}: FilterBarProps) {
  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0 || search.trim().length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Search and filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>

        {/* Inline filters */}
        {filters.map((filter) => (
          <div key={filter.key} className="w-full sm:w-auto sm:min-w-[140px]">
            {filter.type === "select" && filter.options && (
              <Select
                value={filterValues[filter.key] || ""}
                onValueChange={(val) => onFilterChange(filter.key, val === "__all__" ? "" : val || "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{filter.label}</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {filter.type === "boolean" && (
              <Select
                value={filterValues[filter.key] || ""}
                onValueChange={(val) => onFilterChange(filter.key, val === "__all__" ? "" : val || "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{filter.label}</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        ))}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="w-full sm:w-auto gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
