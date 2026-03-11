import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import ContractTypeForm from "@/components/contract-type/contract-type-form";

const ContractTypeCreatePage = async () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Contract Type</CardTitle>
          <Link href="/admin/contract-type">
            <Button className="bg-blue-500 hover:bg-blue-600">
              Back
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <ContractTypeForm update={false} />
      </CardContent>
    </Card>
  );
};

export default ContractTypeCreatePage;