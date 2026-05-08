import ModuleForm from "@/components/user/module-form";
import { getModuleById } from "@/lib/actions/module-action";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { EditPageShell } from "@/components/ui/edit-page-shell";
import { Blocks } from "lucide-react";

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
    <EditPageShell
      title="Edit Module"
      backHref="/admin/module"
      eyebrow="Module Record"
      icon={Blocks}
    >
        <ModuleForm update={true} data={res.data} />
    </EditPageShell>
  );
};

export default ModuleEditPage;
