import ModuleForm from "@/components/user/module-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const ModuleCreatePage = async () => {

  const route = "/admin/module";
  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <CreatePageShell title="Add Module" backHref="/admin/module">
      <ModuleForm update={false} />
    </CreatePageShell>
  );
};

export default ModuleCreatePage;
