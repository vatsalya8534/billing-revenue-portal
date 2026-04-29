import BillingPlanForm from "@/components/billing-plan/billing-plan-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const BillingPlanCreatePage = async () => {
  const route = "/admin/billing-plan";
  
  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <CreatePageShell title="Add Billing Plan" backHref="/admin/billing-plan">
      <BillingPlanForm update={false} />
    </CreatePageShell>
  );
};

export default BillingPlanCreatePage;
