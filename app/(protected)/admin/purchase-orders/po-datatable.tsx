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

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { MoreHorizontal } from "lucide-react"
import {
    deletePurchaseOrder,
    getPurchaseOrders
} from "@/lib/actions/purschase-order"

import { useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"

// ================= COLUMNS =================
const getColumns = (
    onDelete: (id: string) => void,
    onView: (row: any) => void
): ColumnDef<any>[] => [
        { accessorKey: "customerPONumber", header: "PO Number" },

        {
            header: "Service Type",
            cell: ({ row }) => row.original.ServiceType?.name || "-"
        },

        {
            header: "Contract Duration",
            cell: ({ row }) =>
                row.original.contractDuration
                    ? `${row.original.contractDuration.totalNumberOfMonths} months`
                    : "-"
        },

        {
            header: "Start Date",
            cell: ({ row }) =>
                row.original.startFrom
                    ? new Date(row.original.startFrom).toLocaleDateString("en-GB")
                    : "-"
        },

        {
            header: "End Date",
            cell: ({ row }) =>
                row.original.endDate
                    ? new Date(row.original.endDate).toLocaleDateString("en-GB")
                    : "-"
        },

        {
            accessorKey: "poAmount",
            header: "Amount"
        },

        {
            header: "Billing Plan",
            cell: ({ row }) => row.original.billingPlan?.name || "-"
        },

        {
            accessorKey: "status",
            header: "Status"
        },

        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const id = row.original.id

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 bg-zinc-300">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {/* Navigate to the full-page view */}
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/purchase-orders/view/${id}`}>
                                    View
                                </Link>
                            </DropdownMenuItem>

                            {/* Edit */}
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/purchase-orders/edit/${id}`}>
                                    Edit
                                </Link>
                            </DropdownMenuItem>

                            {/* Delete */}
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    onDelete(id);
                                }}
                                className="text-red-600 cursor-pointer"
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]

// ================= COMPONENT =================
export function PoDataTable({ data }: { data: any[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [purchaseOrder, setPurchaseOrder] = React.useState(data)

    const [selectedPO, setSelectedPO] = useState<any>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    const getAllPurchaseOrder = async () => {
        const result = await getPurchaseOrders()
        setPurchaseOrder(result)
    }

    const deleteHandler = async (id: string) => {
        try {
            await deletePurchaseOrder(id)
            await getAllPurchaseOrder()
            toast.success("Deleted successfully")
        } catch {
            toast.error("Delete failed")
        }
    }

    const handleView = (po: any) => {
        setSelectedPO(po)
        setIsViewOpen(true)
    }

    const table = useReactTable({
        data: purchaseOrder,
        columns: getColumns(deleteHandler, handleView),
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className="space-y-4">

            {/* SEARCH */}
            <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
            />

            {/* TABLE */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="cursor-pointer"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center">
                                    No results
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
