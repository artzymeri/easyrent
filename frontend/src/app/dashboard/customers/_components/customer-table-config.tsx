import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import type { Column, DataTableAction } from "@/components/data-table";
import { Eye, Pencil, Trash2 } from "@/components/data-table";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Customer } from "./types";

export function useCustomerColumns(): Column<Customer>[] {
  const { t } = useTranslation();

  return [
    {
      key: "name",
      header: t("customersPage.tableHeaders.name"),
      sortValue: (c) => `${c.firstName} ${c.lastName}`,
      render: (c) => (
        <span className="font-medium">
          {c.firstName} {c.lastName}
        </span>
      ),
    },
    {
      key: "phone",
      header: t("customersPage.tableHeaders.phone"),
      sortValue: (c) => c.phone,
      render: (c) => <span>{c.phone}</span>,
    },
    {
      key: "email",
      header: t("customersPage.tableHeaders.email"),
      sortValue: (c) => c.email || "",
      render: (c) => (
        <span className="text-muted-foreground">{c.email || "—"}</span>
      ),
    },
    {
      key: "idLicense",
      header: t("customersPage.tableHeaders.idLicense"),
      sortable: false,
      render: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.idNumber && (
            <Badge variant="outline" className="text-xs">
              ID: {c.idNumber}
            </Badge>
          )}
          {c.personalNumber && (
            <Badge variant="outline" className="text-xs">
              PN: {c.personalNumber}
            </Badge>
          )}
          {c.driversLicense && (
            <Badge variant="outline" className="text-xs">
              DL: {c.driversLicense}
            </Badge>
          )}
          {!c.idNumber && !c.personalNumber && !c.driversLicense && (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      key: "registered",
      header: t("customersPage.tableHeaders.registered"),
      sortValue: (c) => new Date(c.createdAt).getTime(),
      render: (c) => (
        <span className="text-sm text-muted-foreground">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];
}

export function useCustomerActions(handlers: {
  onView: (c: Customer) => void;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => Promise<void>;
}): DataTableAction<Customer>[] {
  const { t } = useTranslation();

  return [
    {
      label: t("common.view"),
      icon: <Eye className="h-4 w-4" />,
      onClick: (c) => handlers.onView(c),
    },
    {
      label: t("common.edit"),
      icon: <Pencil className="h-4 w-4" />,
      onClick: (c) => handlers.onEdit(c),
    },
    {
      label: t("common.delete"),
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (c) => handlers.onDelete(c),
      variant: "destructive",
    },
  ];
}
