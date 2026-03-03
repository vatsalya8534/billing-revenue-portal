"use client"

import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/ui/delete-dailog"
import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export interface UserRow {
  id: number
  username: string
  firstName: string
  lastName: string
  role: string
  status: string
  remark?: string
  createdDate: string
  createdBy?: string
}

export const columns: ColumnDef<UserRow>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "username", header: "Username" },
  { accessorKey: "firstName", header: "First Name" },
  { accessorKey: "lastName", header: "Last Name" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "remark", header: "Remark" },
  { accessorKey: "createdDate", header: "Created Date" },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter()

      const handleDelete = async () => {
        try {
          const res = await fetch(`/api/users/delete?id=${row.original.id}`, {
            method: "DELETE",
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || "Delete failed")
          }

          toast.success("User deleted successfully")

          router.refresh()
        } catch (error: any) {
          toast.error(error.message || "Failed to delete role")
        }
      }

      return (
        <div className="flex gap-2">
          {/* Edit Button */}
          <Link href={`/admin/users/edit/${row.original.id}`}>
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
