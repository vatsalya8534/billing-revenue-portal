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
import { Project } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { deleteProject, getProjects } from "@/lib/actions/project"

const getColumns = (onDelete: (id: string) => void): ColumnDef<any>[] => [
    {
        accessorKey: "companyId",
        header: "Company Name",
        cell: ({ row }) => row.original.company.name ?? ""
    },
    {
        accessorKey: "projectName",
        header: "Project Name"
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) =>
            row.original.createdAt ? new Date(row.original.startDate).toLocaleDateString("en-GB") : "-",
    },
    {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) =>
            row.original.createdAt ? new Date(row.original.endDate).toLocaleDateString("en-GB") : "-",
    },
    {
        accessorKey: "poValue",
        header: "PO Value"
    },
    {
        accessorKey: "orderType",
        header: "Order Type"
    },
    {
        accessorKey: "resourceCount",
        header: "Agreed count of Resources"
    },
    {
        accessorKey: "billingPlanId",
        header: "Bill Plan",
        cell: ({ row }) => row.original.billingPlan.name ?? ""
    },
    {
        accessorKey: "totalRevenue",
        header: "Total Revenue till last update"
    },
    {
        accessorKey: "totalCost",
        header: "Total cost till last update"
    },
     {
        accessorKey: "currentGM",
        header: "Current GM%",
        cell: ({row}) => (row.original.totalCost / row.original.totalRevenue) * 100 + " % " 
    },
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
                            <Link href={`/admin/pl/edit/${id}`}>
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

export function PLDataTable({ data }: { data: Project[] }) {

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [project, setProject] = React.useState<any>(data)

    const globalFilterFn = (
        row: any,
        columnId: string,
        filterValue: string
    ) => {
        return String(row.getValue(columnId))
            .toLowerCase()
            .includes(filterValue.toLowerCase())
    }

    const getAllProjects = async () => {
        const projects = await getProjects()
        setProject([...projects])
    }

    const deleteHandler = async (id: string) => {
        try {
            await deleteProject(id);

            await getAllProjects()
        } catch (error) {
            toast.error("Failed to delete projects")
        }
    }

    const table = useReactTable({
        data: project,
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
                                <TableCell colSpan={table.getAllColumns().length} className="text-center">
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