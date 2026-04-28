import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import POForm from "@/components/purchase-order/purchase-order-form";
import Link from "next/link";
import { getBillingPlans } from "@/lib/actions/billing-plan";
import { getContractTypes } from "@/lib/actions/contract-type";
import { getServiceTypes } from "@/lib/actions/service-type";
import { getCustomers } from "@/lib/actions/customer";
import { BillingCycle, BillingPlan, Company, Customer } from "@/types";
import { getContractDurations } from "@/lib/actions/contract-duration";
import { getCompanys } from "@/lib/actions/company";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <Card className="overflow-hidden border-sky-100/80 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.28),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,1),rgba(240,249,255,0.96),rgba(248,250,252,1))] shadow-[0_28px_80px_-40px_rgba(14,165,233,0.35)]">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
             
              <div className="space-y-1">
                <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900">
                  Add Revenue
                </CardTitle>
               
              </div>
            </div>

            <Button className="h-11 rounded-xl border border-sky-200 bg-white/90 px-5 text-sky-700 shadow-[0_14px_36px_-24px_rgba(14,165,233,0.55)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.5)]">
              <Link href="/admin/revenue">Back</Link>
            </Button>
          </div>
        </CardHeader>

        
      </Card>

      <Card className="border-sky-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,252,255,0.98))] shadow-[0_30px_90px_-48px_rgba(15,23,42,0.32)]">
        <CardContent className="pt-6">
          <POForm
            update={false}
            companies={companies as Company[]}
            billingPlan={billingPlan as BillingPlan[]}
            contractType={contractType}
            serviceType={serviceType}
            customers={customers as Customer[]}
            contractDurations={contractDurations} />
        </CardContent>
      </Card>
    </div>
  );
};

export default POCreatePage;
