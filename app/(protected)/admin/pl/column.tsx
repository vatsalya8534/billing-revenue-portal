import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, Eye, Trash } from "lucide-react";
import Link from "next/link";

export const getUsersColumns = ({
  canEdit,
  canDelete,
  onDelete,
}: any): ColumnDef<any>[] => {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "companyId",
      header: "Company Name",
      cell: ({ row }) => row.original.company.name ?? "",
    },
    {
      accessorKey: "projectName",
      header: "Project Name",
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) =>
        row.original.startDate
          ? new Date(row.original.startDate).toLocaleDateString("en-GB")
          : "-",
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) =>
        row.original.endDate
          ? new Date(row.original.endDate).toLocaleDateString("en-GB")
          : "-",
    },
    {
      accessorKey: "poValue",
      header: "PO Value",
    },
    {
      accessorKey: "orderType",
      header: "Order Type",
    },
    {
      accessorKey: "resourceCount",
      header: "Agreed count of Resources",
    },
    {
      accessorKey: "billingPlanId",
      header: "Bill Plan",
      cell: ({ row }) => row.original.billingPlan.name ?? "",
    },
    {
      accessorKey: "totalRevenue",
      header: "Total Billing Cost",
    },
    {
      accessorKey: "totalCost",
      header: "Total Other Cost",
    },

    /* ✅ CURRENT GM WITH CONDITIONAL COLOR */
    {
      accessorKey: "currentGM",
      header: "Current GM%",
      cell: ({ row }) => {
        const revenue = Number(row.original.totalRevenue) || 0;
        const cost = Number(row.original.totalCost) || 0;
        const projected = Number(row.original.projectedProfit) || 0;

        if (revenue === 0) {
          return (
            <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold">
              0 %
            </span>
          );
        }

        const gm = Number(
          (((revenue - cost) / revenue) * 100).toFixed(2)
        );

        const isGood = gm >= projected;

        return (
          <span
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              isGood
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {gm} %
          </span>
        );
      },
    },

    {
      accessorKey: "projectedProfit",
      header: "Projected Profit %",
      cell: ({ row }) => (
        <span className="font-medium text-blue-600">
          {row.original.projectedProfit ?? 0} %
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;

        return status === "ACTIVE" ? (
          <Badge className="bg-green-500">ACTIVE</Badge>
        ) : (
          <Badge variant="destructive">INACTIVE</Badge>
        );
      },
    },
  ];

  columns.push({
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const id = row.original.id as string;

      return (
        <div className="flex gap-2">
          {/* 👁 View */}
          <Button
            size="icon"
            asChild
            className="cursor-pointer bg-blue-500 hover:bg-blue-600"
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
              className="cursor-pointer bg-orange-500 hover:bg-orange-600"
            >
              <Link href={`/admin/pl/edit/${id}`}>
                <EditIcon size={16} />
              </Link>
            </Button>
          )}

          {/* 🗑 Delete */}
          {canDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="cursor-pointer"
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