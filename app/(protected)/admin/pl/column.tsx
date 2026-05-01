import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dailog";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, Eye, Trash } from "lucide-react";
import Link from "next/link";

type ProjectRow = {
  id: string;
  company: {
    name?: string | null;
  };
  billingPlan: {
    name?: string | null;
  };
  projectName?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  poValue?: number | string | null;
  orderType?: string | null;
  resourceCount?: number | null;
  totalRevenue?: number | string | null;
  totalCost?: number | string | null;
  projectedProfit?: number | string | null;
  status?: string | null;
};

type ProjectColumnsProps = {
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onDelete: (id: string) => void;
};

export const getUsersColumns = ({
  canEdit,
  canDelete,
  onDelete,
}: ProjectColumnsProps): ColumnDef<ProjectRow>[] => {
  const columns: ColumnDef<ProjectRow>[] = [
    {
      accessorKey: "companyId",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Company Name
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-semibold  text-black dark:text-slate-4000">
          {row.original.company.name ?? ""}
        </span>
      ),
    },
    {
      accessorKey: "projectName",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Project Name
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-indigo-600 dark:text-indigo-400">
          {row.original.projectName}
        </span>
      ),
    },
    {
      accessorKey: "startDate",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Start Date
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-slate-700 dark:text-slate-300">
          {row.original.startDate
            ? new Date(row.original.startDate).toLocaleDateString("en-GB")
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "endDate",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          End Date
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-slate-700 dark:text-slate-300">
          {row.original.endDate
            ? new Date(row.original.endDate).toLocaleDateString("en-GB")
            : "-"}
        </span>
      ),
    },
    {
      accessorKey: "poValue",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          PO Value
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600">
          ₹ {row.original.poValue}
        </span>
      ),
    },
    {
      accessorKey: "orderType",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Order Type
        </span>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="border-blue-400 text-blue-600 dark:text-blue-400"
        >
          {row.original.orderType}
        </Badge>
      ),
    },
    {
      accessorKey: "resourceCount",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Resources
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.resourceCount}</span>
      ),
    },
    {
      accessorKey: "billingPlanId",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Bill Plan
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-cyan-600">
          {row.original.billingPlan.name ?? ""}
        </span>
      ),
    },
    {
      accessorKey: "totalRevenue",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Billing Cost
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          ₹ {row.original.totalRevenue}
        </span>
      ),
    },
    {
      accessorKey: "totalCost",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Other Cost
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-rose-600">
          ₹ {row.original.totalCost}
        </span>
      ),
    },
    {
      accessorKey: "currentGM",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Current GM%
        </span>
      ),
      cell: ({ row }) => {
        const revenue = Number(row.original.totalRevenue) || 0;
        const cost = Number(row.original.totalCost) || 0;

        const gm =
          revenue === 0
            ? 0
            : Number((((revenue - cost) / revenue) * 100).toFixed(2));

        return (
          <Badge
            className={
              gm >= 20
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : "bg-rose-100 text-rose-700 hover:bg-rose-200"
            }
          >
            {gm} %
          </Badge>
        );
      },
    },

    {
      accessorKey: "projectedProfit",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Projected Profit %
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {row.original.projectedProfit ?? 0} %
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
          Status
        </span>
      ),
      cell: ({ row }) => {
        const status = row.original.status;

        return status === "ACTIVE" ? (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            ACTIVE
          </Badge>
        ) : (
          <Badge variant="destructive">INACTIVE</Badge>
        );
      },
    },
  ];

  columns.push({
    id: "actions",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-white dark:text-slate-4000">
        Action
      </span>
    ),
    cell: ({ row }) => {
      const id = row.original.id as string;

      return (
        <div className="flex gap-2">
          {/* 👁 View */}
          <Button
            size="icon"
            asChild
            className="cursor-pointer rounded-xl bg-blue-500 hover:bg-blue-600 shadow-sm"
          >
            <Link href={`/admin/pl/view/${id}`}>
              <Eye size={16} />
            </Link>
          </Button>

          {/* ✏️ Edit */}
          {canEdit && (
            <Button
              asChild
              size="icon"
              className="cursor-pointer rounded-xl bg-orange-500 hover:bg-orange-600 shadow-sm"
            >
              <Link href={`/admin/pl/edit/${id}`}>
                <EditIcon size={16} />
              </Link>
            </Button>
          )}

          {/* 🗑 Delete */}
          {canDelete && (
            <DeleteDialog
              onConfirm={() => onDelete(id)}
              title="Delete Project?"
              description="Are you sure you want to delete this project? This action cannot be undone."
              confirmText="OK"
            >
              <Button
                size="icon"
                variant="destructive"
                className="cursor-pointer rounded-xl shadow-sm"
              >
                <Trash size={16} />
              </Button>
            </DeleteDialog>
          )}
        </div>
      );
    },
  });

  return columns;
};
