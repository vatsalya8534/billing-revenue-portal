"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export type Customer = {
  id: string
  customerCode: string
  firstName: string
  lastName: string | null
  phone: string
  email: string | null
  city: string | null
  status: "ACTIVE" | "INACTIVE"
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "customerCode",
    header: "Customer Code",
  },
  {
    accessorKey: "firstName",
    header: "Customer Name",
    cell: ({ row }) => {
      const customer = row.original

      return (
        <div>
          {customer.firstName} {customer.lastName ?? ""}
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status

      return (
        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original

      async function deleteCustomer() {
        const confirmDelete = confirm(
          "Are you sure you want to delete this customer?"
        )

        if (!confirmDelete) return

        try {
          const res = await fetch(`/api/customer/${customer.id}`, {
            method: "DELETE",
          })

          const data = await res.json()

          if (data.success) {
            alert("Customer deleted successfully")
            window.location.reload()
          } else {
            alert(data.message || "Delete failed")
          }
        } catch (error) {
          console.error(error)
          alert("Something went wrong")
        }
      }

      return (
        <div className="flex gap-2">
          <Link href={`/admin/customer/edit/${customer.id}`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>

          <Button
            size="sm"
            variant="destructive"
            onClick={deleteCustomer}
          >
            Delete
          </Button>
        </div>
      )
    },
  },
]