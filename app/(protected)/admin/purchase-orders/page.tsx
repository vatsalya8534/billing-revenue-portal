import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPurchaseOrders } from "@/lib/actions/purschase-order";
import { PoDataTable } from "./po-datatable";

const PurchaseOrdersPage = async () => {
  const purchaseOrders = await getPurchaseOrders();

  console.log(purchaseOrders);
  

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Purchase Orders</CardTitle>
        <Link href="/admin/purchase-orders/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create Purchase Order</Button>
        </Link>
      </CardHeader>

      <CardContent>
        <PoDataTable data={purchaseOrders} />
      </CardContent>
    </Card>
  );
};

export default PurchaseOrdersPage;