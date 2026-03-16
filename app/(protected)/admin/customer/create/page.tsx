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
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/customer">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <CustomerForm update={false} />
      </CardContent>
    </Card>
  );
}
