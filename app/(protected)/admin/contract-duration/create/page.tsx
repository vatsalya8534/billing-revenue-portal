import ContractDurationForm from "@/components/contract-duration/contract-duration-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const BillingPlanCreatePage = async () => {

  const route = "/admin/contract-duration";
  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <CreatePageShell title="Add Contract Duration" backHref="/admin/contract-duration">
      <ContractDurationForm update={false} />
    </CreatePageShell>
  );
};

export default BillingPlanCreatePage;
