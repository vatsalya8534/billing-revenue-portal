import { redirect } from "next/navigation";
import CustomerForm from "../../../../../components/customer/customer-form";
import { canAccess } from "@/lib/rbac";
import { CreatePageShell } from "@/components/ui/create-page-shell";

export default async function CreateCustomerPage() {

  const route = "/admin/customer";
  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }
  
  return (
    <CreatePageShell title="Add Customer" backHref="/admin/customer">
      <CustomerForm update={false} />
    </CreatePageShell>
  );
}
