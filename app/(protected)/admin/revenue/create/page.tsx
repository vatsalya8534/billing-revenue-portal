import POForm from "@/components/purchase-order/purchase-order-form";
import { getBillingPlans } from "@/lib/actions/billing-plan";
import { getContractTypes } from "@/lib/actions/contract-type";
import { getServiceTypes } from "@/lib/actions/service-type";
import { getCustomers } from "@/lib/actions/customer";
import { BillingPlan, Company, Customer } from "@/types";
import { getContractDurations } from "@/lib/actions/contract-duration";
import { getCompanys } from "@/lib/actions/company";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const POCreatePage = async () => {
  const billingPlan = await getBillingPlans()
  const contractType = await getContractTypes()
  const serviceType = await getServiceTypes()
  const customers = await getCustomers()
  const contractDurations = await getContractDurations()
  const companies = await getCompanys()

  const route = "/admin/module";
  const canView = await canAccess(route, "create")
  if (!canView) {
    redirect("/404");
  }

  return (
    <CreatePageShell
      title="Add Revenue"
      backHref="/admin/revenue"
    >
      <POForm
        update={false}
        companies={companies as Company[]}
        billingPlan={billingPlan as BillingPlan[]}
        contractType={contractType}
        serviceType={serviceType}
        customers={customers as Customer[]}
        contractDurations={contractDurations}
      />
    </CreatePageShell>
  );
};

export default POCreatePage;
