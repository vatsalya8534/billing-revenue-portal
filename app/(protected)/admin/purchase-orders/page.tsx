import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPurchaseOrders } from "@/lib/actions/purschase-order";
import { PurchaseOrder } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./column";

const PurchaseOrdersPage = async () => {
  const purchaseOrders: PurchaseOrder[] = await getPurchaseOrders();

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Purchase Orders</CardTitle>
        <Link href="/admin/purchase-orders/create">
          <Button className="bg-blue-500 hover:bg-blue-600">Create Purchase Order</Button>
        </Link>
      </CardHeader>

      <CardContent>
        <DataTable columns={columns} data={purchaseOrders} />
      </CardContent>
    </Card>
  );
};

export default PurchaseOrdersPage;