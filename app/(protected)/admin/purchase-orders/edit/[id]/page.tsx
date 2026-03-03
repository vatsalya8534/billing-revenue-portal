import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import POForm from "@/components/purchase-order/purchase-order-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPurchaseOrderById } from "@/lib/actions/purschase-order";

interface EditPOPageProps {
  params: Promise<{ id: string }>; // params is now a Promise
}

const EditPOPage = async ({ params }: EditPOPageProps) => {
  const { id } = await params; 

  const po = await getPurchaseOrderById(id);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Edit Purchase Order</CardTitle>
        <Link href="/admin/purchase-orders">
          <Button variant="secondary">Back</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <POForm data={po.data} update={true} />
      </CardContent>
    </Card>
  );
};

export default EditPOPage;