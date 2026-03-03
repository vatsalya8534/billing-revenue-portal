"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { deletePurchaseOrder, getPurchaseOrders } from "@/lib/actions/purschase-order"

const getColumns = (onDelete: (id: string) => void): ColumnDef<any>[] => [
    { accessorKey: "customerPONumber", header: "PO Number" },
    { accessorKey: "serviceType", header: "Service Type" },
    { accessorKey: "contractDuration", header: "Contract Duration" },
    {
        accessorKey: "startFrom", header: "Start Date",
        cell: ({ row }) =>
            row.original.startFrom
                ? new Date(row.original.startFrom).toLocaleDateString("en-GB")
                : "-"
    },
    {
        accessorKey: "endDate", header: "End Date",
        cell: ({ row }) =>
            row.original.endDate
                ? new Date(row.original.endDate).toLocaleDateString("en-GB")
                : "-"
    },
    { accessorKey: "poAmount", header: "Amount" },
    { accessorKey: "billingPlan", header: "Billing Plan" },
    { accessorKey: "status", header: "Status" },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
            const id = row.original.id as string
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 bg-zinc-300">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/purchase-orders/edit/${id}`}>
                                Edit
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault()
                                onDelete(id)
                            }}
                            className="text-red-600 cursor-pointer"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export function PoDataTable({ data }: { data: any }) {

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [purchaseOrder, setPurchaseOrder] = React.useState<any>(data)

    const globalFilterFn = (
        row: any,
        columnId: string,
        filterValue: string
    ) => {
        return String(row.getValue(columnId))
            .toLowerCase()
            .includes(filterValue.toLowerCase())
    }

    const getAllPurchaseOrder = async () => {
        const result = await getPurchaseOrders()
        setPurchaseOrder([...result])
    }

    const deleteHandler = async (id: string) => {
        try {
            await deletePurchaseOrder(id);

            await getAllPurchaseOrder()
        } catch (error) {
            toast.error("Failed to delete sprint")
        }
    }

    const table = useReactTable({
        data: purchaseOrder,
        columns: getColumns(deleteHandler),
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className="space-y-4">

            <Input
                placeholder="Search..."
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="cursor-pointer select-none"
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}

                                        {{
                                            asc: " 🔼",
                                            desc: " 🔽",
                                        }[header.column.getIsSorted() as string] ?? null}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
            </div>
        </div>
    )
}