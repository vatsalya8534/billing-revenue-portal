import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import ContractTypeForm from "@/components/contract-type/contract-type-form";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";

const ContractTypeCreatePage = async () => {
  const route = "/admin/contract-type";

  const canCreate = await canAccess(route, "create")
  if (!canCreate) {
    redirect("/404");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Contract Type</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/contract-type">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ContractTypeForm update={false} />
      </CardContent>
    </Card>
  );
};

export default ContractTypeCreatePage;