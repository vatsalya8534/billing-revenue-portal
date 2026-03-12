import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CustomerForm from "../../../../../components/customer/customer-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CreateCustomerPage() {

  return (
   <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Customer</CardTitle>
          <Link href="/admin/customer">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Back
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
         <CustomerForm  update={false} />
      </CardContent>
    </Card>
  );
}
