"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  actions?: React.ReactNode
  className?: string
  rowClassName?: (row: TData, index: number) => string
}

function getRowEdgeClass(className: string) {
  const tokens = className.split(/\s+/).filter(Boolean)

  return tokens
    .filter(
      (token) =>
        token.startsWith("border-l-") ||
        token.startsWith("border-emerald-") ||
        token.startsWith("border-rose-")
    )
    .join(" ")
}

function getDefaultAlternateRowClass(index: number) {
  return index % 2 === 0
    ? `
      bg-emerald-50/70
      dark:bg-emerald-950/20
      hover:bg-emerald-100/80
      dark:hover:bg-emerald-900/30
      transition-all duration-300
    `
    : `
      bg-white
      dark:bg-background
      hover:bg-slate-50
      dark:hover:bg-slate-900/40
      transition-all duration-300
    `
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = "",
  actions,
  className,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [currentData, setCurrentData] = React.useState<TData[]>(data)

  React.useEffect(() => {
    setCurrentData(data)
  }, [data])

  const globalFilterFn = (
    row: any,
    columnId: string,
    filterValue: string
  ) => {
    return String(row.getValue(columnId) ?? "")
      .toLowerCase()
      .includes(filterValue.toLowerCase())
  }

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

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl font-bold">
            {title}
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />

          <div className={cn("rounded-xl border overflow-x-auto", className)}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-slate-400 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-800"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none whitespace-nowrap text-slate-900 dark:text-slate-100"
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {{
                            asc: "🔼",
                            desc: "🔽",
                          }[
                            header.column.getIsSorted() as string
                          ] ?? null}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => {
                    const rowClasses = rowClassName
                      ? rowClassName(row.original, index)
                      : getDefaultAlternateRowClass(index)
                    const rowEdgeClasses =
                      getRowEdgeClass(rowClasses)

                    return (
                      <TableRow
                        key={row.id}
                        className={rowClasses}
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "whitespace-nowrap",
                              index === 0 && rowEdgeClasses
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
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
