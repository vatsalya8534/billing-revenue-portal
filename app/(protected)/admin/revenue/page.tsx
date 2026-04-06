import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPurchaseOrders } from "@/lib/actions/purschase-order";
import { canAccess } from "@/lib/rbac";
import { redirect } from "next/navigation";
import RevenueDataTable from "./revenue-data-table";

const PurchaseOrdersPage = async () => {
  const res = await getPurchaseOrders();

  const purchaseOrders = res?.success && res?.data ? res.data : [];


  const route = "/admin/module";
  const canView = await canAccess(route, "view")
  if (!canView) {
    redirect("/404");
  }
  
  const canCreate = await canAccess(route, "create");
  const canEdit = await canAccess(route, "edit");
  const canDelete = await canAccess(route, "delete");

  return (
    <Card>
      <CardContent>
        <RevenueDataTable data={JSON.parse(JSON.stringify(purchaseOrders))}
          canEdit={canEdit}
          canDelete={canDelete}
          title="Revenue"
          actions={
            canCreate && (
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Link href="/admin/revenue/create">Add Revenue</Link>
              </Button>
            )
          } />
      </CardContent>
    </Card>
  );
};

export default PurchaseOrdersPage;