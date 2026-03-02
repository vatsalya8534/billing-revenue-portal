"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Role } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DeleteDialog } from "@/components/ui/delete-dailog" 

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "roleName",
    header: "Role Name",
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "createdDate",
    header: "Created Date",
    cell: ({ row }) =>
      row.original.createdDate
        ? new Date(row.original.createdDate).toLocaleDateString()
        : "-",
  },
  {
    accessorKey: "remark",
    header: "Remark",
    cell: ({ row }) => row.original.remark ?? "-",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter()

      const handleDelete = async () => {
        try {
          const res = await fetch(`/api/role/delete?id=${row.original.id}`, {
            method: "DELETE",
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || "Delete failed")
          }

          toast.success("Role deleted successfully ✅")

          // Refresh table without full reload
          router.refresh()
        } catch (error: any) {
          toast.error(error.message || "Failed to delete role")
        }
      }

      return (
        <div className="flex gap-2">
          {/* Edit Button */}
          <Link href={`/admin/roles/${row.original.id}/edit`}>
            <Button size="sm">Edit</Button>
          </Link>

          {/* Delete Button with ShadCN Dialog */}
          <DeleteDialog onConfirm={handleDelete}>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </DeleteDialog>
        </div>
      )
    },
  },
]