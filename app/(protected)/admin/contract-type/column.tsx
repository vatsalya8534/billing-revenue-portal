"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditIcon, Trash } from "lucide-react"
export const getUsersColumns = ({
  canEdit,
  canDelete,
  onDelete,
}: any): ColumnDef<any>[] => {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "remark",
      header: "Remark",
      cell: ({ row }) => row.original.remark ?? "-",
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString("en-GB")
          : "-",
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

  // ✅ Add Action column only if permission exists
  if (canEdit || canDelete) {
    columns.push({
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id as string;

        return (
          <div className="flex gap-2">
            {canEdit && (
              <Button
                asChild
                size="icon"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Link href={`/admin/contract-type/edit/${id}`}>
                  <EditIcon size={16} />
                </Link>
              </Button>
            )}

            {canDelete && (
              <Button
                size="icon"
                variant="destructive"
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