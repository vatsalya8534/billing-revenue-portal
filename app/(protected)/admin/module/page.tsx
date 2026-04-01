import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getModules } from "@/lib/actions/module-action";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Module } from "@/types";
import { ModuleDataTable } from "./module-data-table";

const ModulePage = async () => {

  const modules = await getModules();

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Modules</CardTitle>
        <Link href="/admin/module/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create Module</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ModuleDataTable data={modules} />
      </CardContent>
    </Card>
  );
};

export default ModulePage;
