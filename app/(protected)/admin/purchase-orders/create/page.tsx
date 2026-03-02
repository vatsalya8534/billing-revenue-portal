import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import POForm from "@/components/purchase-order/purchase-order-form";
import Link from "next/link";

const POCreatePage = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Add Purchase Order</CardTitle>
          <Link href="/admin/purchase-orders">
            <Button className="bg-blue-500 hover:bg-blue-600">Back</Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <POForm update={false} />
      </CardContent>
    </Card>
  );
};

export default POCreatePage;