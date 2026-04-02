import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ModuleForm from "@/components/user/module-form";
import { getModuleById } from "@/lib/actions/module-action";
import { canAccess } from "@/lib/rbac";
import Link from "next/link";
import { redirect } from "next/navigation";

const ModuleEditPage = async ({ params }: { params: Promise<{ id: string }> }) => {

  const { id } = await params;

  const res = await getModuleById(id);

  if (!res?.success || !res.data) {
    redirect("/404");
  }

  const route = "/admin/module";
  const canEdit = await canAccess(route, "edit")
  if (!canEdit) {
    redirect("/404");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h1>Edit Module</h1>

          <Button asChild className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/module">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ModuleForm update={true} data={res.data} />
      </CardContent>
    </Card>
  );
};

export default ModuleEditPage;