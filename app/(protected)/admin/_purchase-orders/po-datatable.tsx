"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";

import {
  deletePurchaseOrder,
  getPurchaseOrders,
} from "@/lib/actions/purschase-order";

// ================= TYPES =================
type PurchaseOrderType = {
  id: string;
  customerPONumber: string;
  poAmount: number;
  status: string;

  ServiceType?: { name: string };
  billingPlan?: { name: string };
  customer?: { firstName: string; lastName: string };
};

// ================= COLUMNS =================
const getColumns = (
  onDelete: (id: string) => void
): ColumnDef<PurchaseOrderType>[] => [
  {
    header: "Customer Name",
    cell: ({ row }) =>
      row.original.customer
        ? `${row.original.customer.firstName} ${row.original.customer.lastName}`
        : "-",
  },

  {
    header: "PO Amount",
    cell: ({ row }) =>
      `₹ ${Number(row.original.poAmount || 0).toLocaleString("en-IN")}`,
  },

  {
    header: "Billing Plan",
    cell: ({ row }) => row.original.billingPlan?.name || "-",
  },

  {
    header: "Service Type",
    cell: ({ row }) => row.original.ServiceType?.name || "-",
  },

  // ✅ FIXED: actions column inside array
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 bg-zinc-300">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/purchase-orders/view/${id}`}>
                View
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href={`/admin/purchase-orders/edit/${id}`}>
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                onDelete(id);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// ================= COMPONENT =================
export function PoDataTable({ data }: { data: PurchaseOrderType[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [purchaseOrders, setPurchaseOrders] = React.useState(data || []);

  // ---------------- REFRESH DATA ----------------
  const refreshData = async () => {
    const res: any = await getPurchaseOrders();

    if (res.success && res.data) {
      setPurchaseOrders(res.data);
    } else {
      setPurchaseOrders([]);
      toast.error("Failed to fetch data");
    }
  };

  // ---------------- DELETE ----------------
  const deleteHandler = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this PO?"
    );
    if (!confirmed) return;

    const res = await deletePurchaseOrder(id);

    if (res.success) {
      toast.success("Deleted successfully");
      await refreshData();
    } else {
      toast.error("Delete failed");
    }
  };

  // ---------------- TABLE ----------------
  const table = useReactTable({
    data: purchaseOrders,
    columns: getColumns(deleteHandler),
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // ---------------- UI ----------------
  return (
    <div className="space-y-4">
      <Input
        placeholder="Search..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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
                <TableCell colSpan={5} className="text-center">
                  No results
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}