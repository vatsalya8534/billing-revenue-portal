import RoleForm from "@/components/role/role-form";
import { getModules } from "@/lib/actions/module-action";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const RoleCreatePage = async () => {

  const modules = await getModules();

  const route = "/admin/roles";

  const canCreate = await canAccess(route, "create")

  if (!canCreate) {
    redirect("/404");
  }

  return (
    <CreatePageShell title="Add Role" backHref="/admin/roles">
      <RoleForm update={false} modules={modules} />
    </CreatePageShell>
  );
};

export default RoleCreatePage;
