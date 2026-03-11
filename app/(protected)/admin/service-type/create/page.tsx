import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import ServiceTypeForm from "@/components/service-type/service-type-form";

const ServiceTypeCreatePage = async () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Service Type</CardTitle>
          <Link href="/admin/service-type">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Back
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <ServiceTypeForm update={false} />
      </CardContent>
    </Card>
  );
};

export default ServiceTypeCreatePage;