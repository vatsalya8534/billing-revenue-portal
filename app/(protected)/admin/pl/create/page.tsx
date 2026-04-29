import { getCompanys } from "@/lib/actions/company";
import { getBillingPlans } from "@/lib/actions/billing-plan";
import PLForm from "@/components/pl/pl-form";
import { BillingPlan, Company } from "@/types";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { CreatePageShell } from "@/components/ui/create-page-shell";

const ServiceTypeCreatePage = async () => {
    const companies = await getCompanys()
    const billingPlans = await getBillingPlans()

    const route = "/admin/pl";
    const canCreate = await canAccess(route, "create")

    if (!canCreate) {
        redirect("/404");
    }

    return (
        <CreatePageShell title="Add Project" backHref="/admin/pl">
            <PLForm billingCycles={[]} companies={companies as Company[]} billingPlans={billingPlans as BillingPlan[]} update={false} />
        </CreatePageShell>
    );
};

export default ServiceTypeCreatePage;
