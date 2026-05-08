import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/ui/delete-dailog"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, Trash } from "lucide-react"
import Link from "next/link"

export const getUsersColumns = ({
    canEdit,
    canDelete,
    onDelete,
}: any): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "remark",
            header: "Remark",
            cell: ({ row }) => row.original.remark ?? "-",
        },
        {
            accessorKey: "createdAt",
            header: "Created Date",
            cell: ({ row }) =>
                row.original.createdAt
                    ? new Date(row.original.createdAt).toLocaleDateString("en-GB")
                    : "-",
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
                                <Link href={`/admin/service-type/edit/${id}`}>
                                    <EditIcon size={16} />
                                </Link>
                            </Button>
                        )}

                        {canDelete && (
                            <DeleteDialog
                                onConfirm={() => onDelete(id)}
                                title="Delete Service Type?"
                                description="Are you sure you want to delete this service type? This action cannot be undone."
                            >
                                <Button
                                    size="icon"
                                    variant="destructive"
                                >
                                    <Trash size={16} />
                                </Button>
                            </DeleteDialog>
                        )}
                    </div>
                );
            },
        });
    }

    return columns;
};
