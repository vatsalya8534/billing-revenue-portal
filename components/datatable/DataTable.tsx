"use client"

import * as React from "react"
import {
  ColumnDef,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    setCurrentData(data)
  }, [data])

  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, data])

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
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />

            {/* <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-medium">Rows per page</span>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="h-9 w-[88px]">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  {[8, 10].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <div className={cn("rounded-xl border overflow-x-auto", className)}>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-[#2F6F57] hover:bg-[#2F6F57]"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none whitespace-nowrap text-white"
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

          <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {table.getRowModel().rows.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              entries
            </p>

            <div className="flex items-center gap-2">
              <p className="mr-2 text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {table.getPageCount() || 1}
                </span>
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
