"use client"

import * as React from "react"

import { toast } from "sonner"
import { getUsersColumns } from "./column";
import { DataTable } from "@/components/datatable/DataTable";
import { deleteProject } from "@/lib/actions/project";

export default function PLDataTable({
    data,
    canEdit,
    canDelete,
    canView,
    title,
    actions
}: any) {
    const [tableData, setTableData] = React.useState(data);

    const deleteHandler = async (id: string) => {

        const res = await deleteProject(id);

        if (!res?.success) {
            toast.error("Error", { description: res?.message });
            return;
        }

        toast.success("success", { description: res?.message });

        console.log(res);

        setTableData((prev: any[]) =>
            prev.filter((r) => r.id !== id)
        );
    };

    console.log(tableData);
    

    const columns = getUsersColumns({
        canView,
        canEdit,
        canDelete,
        onDelete: deleteHandler,
    });

    return <DataTable data={tableData} columns={columns} title={title} actions={actions} />;
}