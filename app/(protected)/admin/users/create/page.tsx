import UserForm from "@/components/user/user-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const UserCreatePage = async () => {

  const route = "/admin/users";
  const canCreate = await canAccess(route, "create");
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <CreatePageShell title="Add User" backHref="/admin/users">
      <UserForm update={false} />
    </CreatePageShell>
  );
};

export default UserCreatePage;
