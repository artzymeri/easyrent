"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";

// ─── Types ────────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  sortValue?: (row: T) => string | number | Date;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  hidden?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string | number;
  searchFn?: (row: T, query: string) => boolean;
  actions?: DataTableAction<T>[];
  emptyMessage?: string;
  pageSize?: number;
  defaultSortKey?: string;
  defaultSortDir?: "asc" | "desc";
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchFn,
  actions,
  emptyMessage,
  pageSize: initialPageSize = 10,
  defaultSortKey,
  defaultSortDir = "asc",
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    if (!search.trim() || !searchFn) return data;
    const q = search.toLowerCase();
    return data.filter((row) => searchFn(row, q));
  }, [data, search, searchFn]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.sortValue) return filtered;
    const fn = col.sortValue;
    return [...filtered].sort((a, b) => {
      const aVal = fn(a);
      const bVal = fn(b);
      let cmp = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        cmp = aVal.localeCompare(bVal);
      } else {
        cmp = (aVal as number) < (bVal as number) ? -1 : (aVal as number) > (bVal as number) ? 1 : 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const from = sorted.length === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min((safePage + 1) * pageSize, sorted.length);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(0);
  };

  const hasActions = actions && actions.length > 0;

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <p className="text-center text-muted-foreground">
            {emptyMessage ?? t("common.noResults")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <DataTableToolbar
          hasSearch={!!searchFn}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(0); }}
          from={from}
          to={to}
          total={sorted.length}
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((col) => {
                  const isSortable = col.sortable !== false && !!col.sortValue;
                  const isActive = sortKey === col.key;
                  return (
                    <TableHead
                      key={col.key}
                      className={`${col.className ?? ""} ${isSortable ? "cursor-pointer select-none" : ""}`}
                      onClick={isSortable ? () => toggleSort(col.key) : undefined}
                    >
                      <span className="flex items-center gap-1.5">
                        {col.header}
                        {isSortable &&
                          (isActive ? (
                            sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-foreground" /> : <ArrowDown className="h-3.5 w-3.5 text-foreground" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                          ))}
                      </span>
                    </TableHead>
                  );
                })}
                {hasActions && <TableHead className="w-12 text-right">{t("common.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="py-12 text-center text-muted-foreground">
                    {t("common.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((row) => (
                  <TableRow key={getRowId(row)} className={`group ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`} onClick={() => onRowClick?.(row)}>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>{col.render(row)}</TableCell>
                    ))}
                    {hasActions && (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100" />}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions!.map((action, i) => {
                              if (action.hidden?.(row)) return null;
                              const needsSep = action.variant === "destructive" && i > 0 && actions![i - 1]?.variant !== "destructive";
                              return (
                                <span key={i}>
                                  {needsSep && <DropdownMenuSeparator />}
                                  <DropdownMenuItem
                                    onClick={() => action.onClick(row)}
                                    className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
                                  >
                                    {action.icon}
                                    {action.label}
                                  </DropdownMenuItem>
                                </span>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          page={safePage}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
        />
      </CardContent>
    </Card>
  );
}

export { Eye, Pencil, Trash2 };
