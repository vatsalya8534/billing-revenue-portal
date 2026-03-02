// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import POForm from "@/components/purchase-order/purchase-order-form";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { getPurchaseOrderById } from "@/lib/actions/purschase-order";

// interface EditPOPageProps {
//   params: { id: string };
// }

// const EditPOPage = async ({ params }: EditPOPageProps) => {
//   const { id } = await params; 
//   const numericId = Number(params.id);
//   if (isNaN(numericId)) return notFound();

//   const po = await getPurchaseOrderById(numericId);
//   if (!po) return notFound();

//   const formData = {
//     id: po.id,
//     poNumber: po.poNumber,
//     serviceType: po.serviceType,
//     startFrom: po.startFrom.toISOString().split("T")[0], // YYYY-MM-DD
//     endDate: po.endDate.toISOString().split("T")[0],
//     contractType: po.contractType,
//     contractDuration: po.contractDuration,
//     paymentTerms: po.paymentTerms,
//     billingPlan: po.billingPlan,
//     poAmount: po.poAmount,
//     status: po.status,
//     createdByUserId: po.createdByUserId,
//     remark: po.remark ?? "",
//   };

//   return (
//     <Card>
//       <CardHeader className="flex justify-between items-center">
//         <CardTitle>Edit Purchase Order</CardTitle>
//         <Link href="/admin/purchase-orders">
//           <Button variant="secondary">Back</Button>
//         </Link>
//       </CardHeader>
//       <CardContent>
//         <POForm data={formData} update={true} />
//       </CardContent>
//     </Card>
//   );
// };

// export default EditPOPage;

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
  const numericId = Number(id); // ✅ use destructured id
  if (isNaN(numericId)) return notFound();

  const po = await getPurchaseOrderById(numericId);
  if (!po) return notFound();

  const formData = {
    id: po.id,
    poNumber: po.poNumber,
    serviceType: po.serviceType,
    startFrom: po.startFrom.toISOString().split("T")[0],
    endDate: po.endDate.toISOString().split("T")[0],
    contractType: po.contractType,
    contractDuration: po.contractDuration,
    paymentTerms: po.paymentTerms,
    billingPlan: po.billingPlan,
    poAmount: po.poAmount,
    status: po.status,
    createdByUserId: po.createdByUserId,
    remark: po.remark ?? "",
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Edit Purchase Order</CardTitle>
        <Link href="/admin/purchase-orders">
          <Button variant="secondary">Back</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <POForm data={formData} update={true} />
      </CardContent>
    </Card>
  );
};

export default EditPOPage;