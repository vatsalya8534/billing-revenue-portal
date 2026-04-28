import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, Eye, Trash } from "lucide-react";
import Link from "next/link";

type BillingCycleRow = {
  collectedAmount?: number | null;
};

type RevenueRow = {
  id: string;
  company?: { name?: string | null } | null;
  customer?: { companyName?: string | null } | null;
  customerPONumber?: string | null;
  poOwner?: string | null;
  poAmount?: number | null;
  billingCycles?: BillingCycleRow[] | null;
  billingPlan?: { name?: string | null } | null;
  ServiceType?: { name?: string | null } | null;
  status?: string | null;
};

function formatCurrency(value: number) {
  return `₹ ${Math.round(value || 0).toLocaleString("en-IN")}`;
}

export const getUsersColumns = ({
  canEdit,
  canDelete,
  onDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
  onDelete: (id: string) => void;
}): ColumnDef<RevenueRow>[] => {
  const columns: ColumnDef<RevenueRow>[] = [
    {
      accessorKey: "companyId",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white">
          Company
        </span>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            {row.original.company?.name || "-"}
          </p>
          <p className="text-xs text-slate-500">
            {row.original.customer?.companyName || "No mapped customer"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "customerPONumber",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white">
          PO Number
        </span>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-medium text-slate-900">
            {row.original.customerPONumber || "-"}
          </p>
          <p className="text-xs text-slate-500">
            Owner: {row.original.poOwner || "Unassigned"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "poAmount",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white">
          Contract Value
        </span>
      ),
      cell: ({ row }) => {
        const billed = Number(row.original.poAmount || 0);
        const collected = (row.original.billingCycles || []).reduce((sum, cycle) => {
          return sum + Number(cycle.collectedAmount || 0);
        }, 0);

        return (
          <div className="space-y-1">
            <p className="font-semibold text-emerald-600">
              {formatCurrency(billed)}
            </p>
            <p className="text-xs text-slate-500">
              Collected {formatCurrency(collected)}
            </p>
          </div>
        );
      },
    },
    {
      id: "collectionHealth",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white">
          Collection Health
        </span>
      ),
      cell: ({ row }) => {
        const billed = Number(row.original.poAmount || 0);
        const collected = (row.original.billingCycles || []).reduce((sum, cycle) => {
          return sum + Number(cycle.collectedAmount || 0);
        }, 0);
        const pending = Math.max(billed - collected, 0);
        const ratio = billed > 0 ? Math.round((collected / billed) * 100) : 0;

        return (
          <div className="min-w-[160px] space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>{ratio}% realized</span>
              <span>{formatCurrency(pending)} pending</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sky-100">
              <div
                className={`h-full rounded-full ${
                  ratio >= 85
                    ? "bg-emerald-500"
                    : ratio >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(ratio, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "billingPlanId",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white">
          Billing Plan
        </span>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50"
        >
          {row.original.billingPlan?.name || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "serviceTypeId",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white">
          Service Type
        </span>
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
        >
          {row.original.ServiceType?.name || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <span className="text-xs font-semibold uppercase tracking-wider text-white">
          Status
        </span>
      ),
      cell: ({ row }) => {
        const status = row.original.status;

        if (status === "LIVE") {
          return (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
              LIVE
            </Badge>
          );
        }

        if (status === "COMPLETED") {
          return (
            <Badge className="bg-sky-500 text-white hover:bg-sky-600">
              COMPLETED
            </Badge>
          );
        }

        return (
          <Badge variant="destructive" className="text-white">
            {status}
          </Badge>
        );
      },
    },
  ];

  columns.push({
    id: "actions",
    header: () => (
      <span className="text-xs font-semibold uppercase tracking-wider text-white">
        Action
      </span>
    ),
    cell: ({ row }) => {
      const id = row.original.id as string;

      return (
        <div className="flex gap-2">
          <Button
            size="icon"
            asChild
            className="cursor-pointer rounded-xl bg-blue-500 shadow-sm hover:bg-blue-600"
          >
            <Link href={`/admin/revenue/view/${id}`}>
              <Eye size={16} />
            </Link>
          </Button>

          {canEdit && (
            <Button
              asChild
              size="icon"
              className="cursor-pointer rounded-xl bg-orange-500 shadow-sm hover:bg-orange-600"
            >
              <Link href={`/admin/revenue/edit/${id}`}>
                <EditIcon size={16} />
              </Link>
            </Button>
          )}

          {canDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="cursor-pointer rounded-xl shadow-sm"
              onClick={() => onDelete(id)}
            >
              <Trash size={16} />
            </Button>
          )}
        </div>
      );
    },
  });

  return columns;
};
