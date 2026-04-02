import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import ServiceTypeForm from "@/components/service-type/service-type-form";
import { getCompanys } from "@/lib/actions/company";
import { getBillingPlans } from "@/lib/actions/billing-plan";
import PLForm from "@/components/pl/pl-form";
import { BillingPlan, Company } from "@/types";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";

const ServiceTypeCreatePage = async () => {
    let companies = await getCompanys()
    let billingPlans = await getBillingPlans()

    const route = "/admin/pl";
    const canCreate = await canAccess(route, "create")

    if (!canCreate) {
        redirect("/404");
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Add Project</CardTitle>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <Link href="/admin/pl">Back</Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <PLForm billingCycles={[]} companies={companies as Company[]} billingPlans={billingPlans as BillingPlan[]} update={false} />
            </CardContent>
        </Card>
    );
};

export default ServiceTypeCreatePage;