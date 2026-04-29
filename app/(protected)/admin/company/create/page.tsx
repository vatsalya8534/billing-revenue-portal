import { redirect } from "next/navigation";
import CompanyForm from "@/components/company/company-form";
import { canAccess } from "@/lib/rbac";
import { CreatePageShell } from "@/components/ui/create-page-shell";

export default async function CreateCustomerPage() {
  const route = "/admin/company";

  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <CreatePageShell title="Add Company" backHref="/admin/company">
      <CompanyForm update={false} />
    </CreatePageShell>
  );
}
