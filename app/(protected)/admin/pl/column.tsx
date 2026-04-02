import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, Eye, Trash, View } from "lucide-react"
import Link from "next/link"
export const getUsersColumns = ({
    canEdit,
    canDelete,
    onDelete,
}: any): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "companyId",
            header: "Company Name",
            cell: ({ row }) => row.original.company.name ?? "",
        },
        {
            accessorKey: "projectName",
            header: "Project Name",
        },
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({ row }) =>
                row.original.startDate
                    ? new Date(row.original.startDate).toLocaleDateString("en-GB")
                    : "-",
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({ row }) =>
                row.original.endDate
                    ? new Date(row.original.endDate).toLocaleDateString("en-GB")
                    : "-",
        },
        {
            accessorKey: "poValue",
            header: "PO Value",
        },
        {
            accessorKey: "orderType",
            header: "Order Type",
        },
        {
            accessorKey: "resourceCount",
            header: "Agreed count of Resources",
        },
        {
            accessorKey: "billingPlanId",
            header: "Bill Plan",
            cell: ({ row }) => row.original.billingPlan.name ?? "",
        },
        {
            accessorKey: "totalRevenue",
            header: "Total Billing Cost",
        },
        {
            accessorKey: "totalCost",
            header: "Total Other cost",
        },
        {
            accessorKey: "currentGM",
            header: "Current GM%",
            cell: ({ row }) => {
                const revenue = Number(row.original.totalRevenue) || 0;
                const cost = Number(row.original.totalCost) || 0;

                if (revenue === 0) return "0 %";

                return (((revenue - cost) / revenue) * 100).toFixed(2) + " %";
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status;

                return status === "ACTIVE" ? (
                    <Badge className="bg-green-500">ACTIVE</Badge>
                ) : (
                    <Badge variant="destructive">INACTIVE</Badge>
                );
            },
        },
    ];

    columns.push({
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
            const id = row.original.id as string;

            return (
                <div className="flex gap-2">
                    {/* 👁 View (always visible) */}
                    <Button size="icon" asChild  className="bg-blue-500 hover:bg-blue-600">
                        <Link href={`/admin/pl/view/${id}`}>
                            <Eye size={16} />
                        </Link>
                    </Button>

                    {/* ✏️ Edit */}
                    {canEdit && (
                        <Button
                            asChild
                            size="icon"
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            <Link href={`/admin/pl/edit/${id}`}>
                                <EditIcon size={16} />
                            </Link>
                        </Button>
                    )}

                    {/* 🗑 Delete */}
                    {canDelete && (
                        <Button
                            size="icon"
                            variant="destructive"
                            className="cursor-pointer"
                            onClick={() => onDelete(id)}
                        >
                            <Trash size={16} />
                        </Button>
                    )}
                </div>
            );
        },
    });

    return columns;
};