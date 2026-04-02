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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    title?: string;
    actions?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title = "",
    actions
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")

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

    const [currentData, setCurrentData] = React.useState<any>([...data]);

    const table = useReactTable({
        data: currentData,
        columns,
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

    React.useEffect(() => {
        setCurrentData([...data])
    }, [data.length])

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    {/* LEFT → TITLE */}
                    <CardTitle className="text-2xl font-bold">{title}</CardTitle>

                    {/* RIGHT → ACTIONS */}
                    <div className="flex gap-2">
                        {actions}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
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
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}