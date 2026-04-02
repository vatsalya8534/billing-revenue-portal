import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CustomerForm from "../../../../../components/customer/customer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CompanyForm from "@/components/company/company-form";
import { canAccess } from "@/lib/rbac";

export default async function CreateCustomerPage() {
  const route = "/admin/company";

  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Company</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/company">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <CompanyForm update={false} />
      </CardContent>
    </Card>
  );
}
