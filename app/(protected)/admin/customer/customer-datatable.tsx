"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import { columns, Customer } from "./column"
import { Button } from "@/components/ui/button"

interface CustomerDatatableProps {
  data: Customer[]
}

export default function CustomerDatatable({ data }: CustomerDatatableProps) {
  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Customers
        </h2>

        <Link href="/admin/customer/create">
          <Button>
            Create Customer
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={data} />

    </div>
  )
}