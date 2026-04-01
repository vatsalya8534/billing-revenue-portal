import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPurchaseOrders } from "@/lib/actions/purschase-order";
import { PoDataTable } from "./po-datatable";
import { PurchaseOrder } from "@/types";

const PurchaseOrdersPage = async () => {
  const res = await getPurchaseOrders();

  const purchaseOrders = res?.success && res?.data ? res.data : [];

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Revenue</CardTitle>

        <Link href="/admin/purchase-orders/create">
          <Button className="bg-blue-500 hover:bg-blue-600">
            Create Revenue
          </Button>
        </Link>
      </CardHeader>

      <CardContent>
        <PoDataTable data={purchaseOrders as any} />
      </CardContent>
    </Card>
  );
};

export default PurchaseOrdersPage;