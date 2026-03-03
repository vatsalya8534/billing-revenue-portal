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
import { Role, User } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { deleteRole, getRoles } from "@/lib/actions/role"
import { deleteUser } from "@/lib/actions/users"


const getColumns = (onDelete: (id: string) => void): ColumnDef<any>[] => [
    { accessorKey: "username", header: "Username" },
    { accessorKey: "firstName", header: "First Name" },
    { accessorKey: "lastName", header: "Last Name" },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) =>
            row.original.roleId && row.original?.role.name
    },
    { accessorKey: "status", header: "Status" },
    {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) =>
            row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString("en-GB") : "-",
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
                            <Link href={`/admin/users/edit/${id}`}>
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

export function UserDataTable({ data }: { data: User[] }) {

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [users, setUsers] = React.useState<any>(data)

    // 🔎 Global filter function
    const globalFilterFn = (
        row: any,
        columnId: string,
        filterValue: string
    ) => {
        return String(row.getValue(columnId))
            .toLowerCase()
            .includes(filterValue.toLowerCase())
    }

    const getAllUsers = async () => {
        const roles = await getRoles()
        setUsers([...roles])
    }

    const deleteHandler = async (id: string) => {
        try {
            await deleteUser(id);

            await getAllUsers()
        } catch (error) {
            toast.error("Failed to delete sprint")
        }
    }

    const table = useReactTable({
        data: users,
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

            {/* 🔎 Search Input */}
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