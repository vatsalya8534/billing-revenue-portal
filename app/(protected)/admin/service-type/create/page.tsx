import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import ServiceTypeForm from "@/components/service-type/service-type-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";

const ServiceTypeCreatePage = async () => {
  const route = "/admin/service-type";
  const canCreate = await canAccess(route, "create");
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Service Type</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/service-type">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ServiceTypeForm update={false} />
      </CardContent>
    </Card>
  );
};

export default ServiceTypeCreatePage;