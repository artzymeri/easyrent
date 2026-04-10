"use client";

import { useTranslation } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DataTableToolbarProps {
  hasSearch: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  from: number;
  to: number;
  total: number;
}

export function DataTableToolbar({
  hasSearch,
  search,
  onSearchChange,
  from,
  to,
  total,
}: DataTableToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
      {hasSearch ? (
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("common.search")}
            className="pl-9"
          />
        </div>
      ) : (
        <div />
      )}
      <p className="text-sm text-muted-foreground">
        {t("common.showing", {
          from: String(from),
          to: String(to),
          total: String(total),
        })}
      </p>
    </div>
  );
}
