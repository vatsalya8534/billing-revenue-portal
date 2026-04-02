"use client"

import * as React from "react"

import { toast } from "sonner"
import { getUsersColumns } from "./column";
import { DataTable } from "@/components/datatable/DataTable";
import { deleteCustomer } from "@/lib/actions/customer";

export default function CustomerDataTable({
  data,
  canEdit,
  canDelete,
  title,
  actions
}: any) {
  const [tableData, setTableData] = React.useState(data);

  const deleteHandler = async (id: string) => {
    const res = await deleteCustomer(id);

    if (!res?.success) {
      toast.error("Error", { description: res?.message });
      return;
    }

    toast.success("Success", { description: res?.message });

    setTableData((prev: any[]) =>
      prev.filter((r) => r.id !== id)
    );
  };

  const columns = getUsersColumns({
    canEdit,
    canDelete,
    onDelete: deleteHandler,
  });

  return <DataTable data={tableData} columns={columns} title={title} actions={actions} />;
}