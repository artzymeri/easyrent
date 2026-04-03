"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  /** Return the raw sortable value */
  sortValue?: (row: T) => string | number | Date;
  /** Render the cell content — receives the row */
  render: (row: T) => React.ReactNode;
  /** If false the header won't be sortable (default true) */
  sortable?: boolean;
  /** Optional className for <th> / <td> */
  className?: string;
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
  /** Hide this action for certain rows */
  hidden?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Row key extractor */
  getRowId: (row: T) => string | number;
  /** Search across these fields (receives row → string) */
  searchFn?: (row: T, query: string) => boolean;
  /** Actions dropdown items */
  actions?: DataTableAction<T>[];
  /** When there are no rows at all (before search) */
  emptyMessage?: string;
  /** Initial page size */
  pageSize?: number;
  /** Initial sort column key */
  defaultSortKey?: string;
  defaultSortDir?: "asc" | "desc";
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

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

  // ── State ─────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // ── Derived data ──────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────
  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const hasActions = actions && actions.length > 0;

  // ── Empty (before search) ─────────────────────────────────
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
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
          {searchFn ? (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
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
              total: String(sorted.length),
            })}
          </p>
        </div>

        {/* Table */}
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
                            sortDir === "asc" ? (
                              <ArrowUp className="h-3.5 w-3.5 text-foreground" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5 text-foreground" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                          ))}
                      </span>
                    </TableHead>
                  );
                })}
                {hasActions && (
                  <TableHead className="w-12 text-right">{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="py-12 text-center text-muted-foreground"
                  >
                    {t("common.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    className={`group ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render(row)}
                      </TableCell>
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
                              const needsSep =
                                action.variant === "destructive" &&
                                i > 0 &&
                                actions![i - 1]?.variant !== "destructive";
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

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("common.rowsPerPage")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("common.page")} {safePage + 1} {t("common.of")} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { Eye, Pencil, Trash2 };
