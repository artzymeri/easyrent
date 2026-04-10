"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

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
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = Object.values(filterValues).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-0 sm:min-w-[200px] sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {/* Filter Popover */}
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger render={
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        } />
        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearFilters();
                    setFilterOpen(false);
                  }}
                  className="h-auto py-1 px-2 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-1.5">
                  <label className="text-sm font-medium">{filter.label}</label>
                  {filter.type === "select" && filter.options && (
                    <Select
                      value={filterValues[filter.key] || ""}
                      onValueChange={(val) => onFilterChange(filter.key, val === "__all__" ? "" : val || "")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`All ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All</SelectItem>
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
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(filterValues).map(([key, value]) => {
            if (!value) return null;
            const filter = filters.find((f) => f.key === key);
            if (!filter) return null;
            
            let displayValue = value;
            if (filter.type === "select" && filter.options) {
              const opt = filter.options.find((o) => o.value === value);
              displayValue = opt?.label || value;
            } else if (filter.type === "boolean") {
              displayValue = value === "true" ? "Yes" : "No";
            }
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pr-1"
              >
                {filter.label}: {displayValue}
                <button
                  onClick={() => onFilterChange(key, "")}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
