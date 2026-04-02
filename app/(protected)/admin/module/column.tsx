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
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "description",
            header: "Description",
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
                                <Link href={`/admin/module/edit/${id}`}>
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