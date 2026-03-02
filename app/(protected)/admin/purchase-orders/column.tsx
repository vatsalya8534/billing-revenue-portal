"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PurchaseOrder } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DeleteDialog } from "@/components/ui/delete-dailog" 

export const columns: ColumnDef<PurchaseOrder>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "poNumber", header: "PO Number" },
  { accessorKey: "serviceType", header: "Service Type" },
  { accessorKey: "contractDuration", header: "Contract Duration" },
  { accessorKey: "startFrom", header: "Start Date", 
    cell: ({ row }) =>
      row.original.startFrom
        ? new Date(row.original.startFrom).toLocaleDateString()
        : "-"
  },
  { accessorKey: "endDate", header: "End Date", 
    cell: ({ row }) =>
      row.original.endDate
        ? new Date(row.original.endDate).toLocaleDateString()
        : "-"
  },
  { accessorKey: "poAmount", header: "Amount" },
  { accessorKey: "billingPlan", header: "Billing Plan" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "remark", header: "Remark" },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const router = useRouter()

      const handleDelete = async () => {
        try {
          const res = await fetch(`/api/purchase-order/delete?id=${row.original.id}`, {
            method: "DELETE",
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || "Delete failed")
          }

          toast.success("Purchase Order deleted successfully ")
          router.refresh() // Refresh table
        } catch (error: any) {
          toast.error(error.message || "Failed to delete PO")
        }
      }

      return (
        <div className="flex gap-2">
          {/* Edit Button */}
          <Link href={`/admin/purchase-orders/${row.original.id}/edit`}>
            <Button size="sm">Edit</Button>
          </Link>

          {/* Delete Button */}
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