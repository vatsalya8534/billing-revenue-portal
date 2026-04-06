import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, Trash, View } from "lucide-react"
import Link from "next/link"
export const getUsersColumns = ({
    canEdit,
    canDelete,
    onDelete,
}: any): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = [

        {
            header: "Company Name",
            cell: ({ row }) =>
                row.original.company?.name || "-",
        },

        {
            header: "PO Number",
            accessorKey: "customerPONumber",
        },

        {
            header: "PO Amount",
            cell: ({ row }) =>
                `₹ ${Math.round(row.original.poAmount || 0).toLocaleString("en-IN")}`,
        },

        {
            header: "Billing Plan",
            cell: ({ row }) => row.original.billingPlan?.name || "-",
        },

        {
            header: "Service Type",
            cell: ({ row }) => row.original.ServiceType?.name || "-",
        },

        {
            header: "Status",
            cell: ({ row }) => row.original.status || "-",
        },
    ];

    if (canEdit || canDelete) {
        columns.push({
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const id = row.original.id as string;

                return (
                    <div className="flex gap-2">
                        {canEdit && (
                            <Button
                                asChild
                                size="icon"
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                <Link href={`/admin/revenue/edit/${id}`}>
                                    <EditIcon size={16} />
                                </Link>
                            </Button>
                        )}

                        {canDelete && (
                            <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => onDelete(id)}
                            >
                                <Trash size={16} />
                            </Button>
                        )}
                    </div>
                );
            },
        });
    }

    return columns;
};