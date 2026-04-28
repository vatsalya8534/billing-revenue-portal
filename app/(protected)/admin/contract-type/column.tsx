"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditIcon, Trash } from "lucide-react";

export const getUsersColumns = ({
  canEdit,
  canDelete,
  onDelete,
}: any): ColumnDef<any>[] => {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: () => (
        <div className="font-semibold text-xs uppercase tracking-wider text-white dark:text-slate-4000">
          Name
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-gray-100">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "remark",
      header: () => (
        <div className="font-semibold text-xs uppercase tracking-wider text-white dark:text-slate-4000">
          Remark
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-300">
          {row.original.remark ?? "-"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="font-semibold text-xs uppercase tracking-wider text-white dark:text-slate-4000">
          Created Date
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-300">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString("en-GB")
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="font-semibold text-xs uppercase tracking-wider text-white dark:text-slate-4000">
          Status
        </div>
      ),
      cell: ({ row }) => {
        const status = row.original.status;

        return status === "ACTIVE" ? (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-full">
            ACTIVE
          </Badge>
        ) : (
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full">
            INACTIVE
          </Badge>
        );
      },
    },
  ];

  if (canEdit || canDelete) {
    columns.push({
      id: "actions",
      header: () => (
        <div className="font-semibold text-xs uppercase tracking-wider text-white dark:text-slate-4000">
          Action
        </div>
      ),
      cell: ({ row }) => {
        const id = row.original.id as string;

        return (
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                asChild
                size="icon"
                className="h-9 w-9 rounded-lg bg-amber-500 hover:bg-amber-600 shadow-sm"
              >
                <Link href={`/admin/contract-type/edit/${id}`}>
                  <EditIcon size={16} />
                </Link>
              </Button>
            )}

            {canDelete && (
              <Button
                size="icon"
                className="h-9 w-9 rounded-lg bg-red-500 hover:bg-red-600 shadow-sm"
                onClick={() => onDelete(id)}
              >
                <Trash size={16} />
              </Button>
            )}
          </div>
        );
      },
    });
  }

  return columns;
};