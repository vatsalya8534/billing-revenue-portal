"use client";

import React from "react";
import { useForm, SubmitHandler, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";

import { z } from "zod";
import { Status, Client } from "@prisma/client";
import { purchaseOrderSchema } from "@/lib/validators";
import { createPurchaseOrder, updatePurchaseOrder } from "@/lib/actions/purschase-order";

export type POFormType = z.infer<typeof purchaseOrderSchema>;

export interface POFormProps {
  data?: {
    id: number;
    poNumber: string;
    serviceType: string;
    startFrom: string;
    endDate: string;
    contractType: string;
    contractDuration: string;
    paymentTerms: string;
    billingPlan: string;
    poAmount: number;
    status: Status;
    createdByUserId: number;
    remark?: string;
  };
  clients?: Client[];
  update?: boolean;
}

const POForm: React.FC<POFormProps> = ({ data, clients = [], update = false }) => {
  const router = useRouter();

  const form = useForm<POFormType>({
    resolver: zodResolver(purchaseOrderSchema) as any,
    defaultValues: data ?? {
      poNumber: "",
      serviceType: "",
      startFrom: "",
      endDate: "",
      contractType: "",
      contractDuration: "",
      paymentTerms: "",
      billingPlan: "",
      poAmount: 0,
      status: Status.ACTIVE,
      createdByUserId: 1,
      remark: "",
    },
  });

  const [isPending, startTransition] = React.useTransition();

  const onSubmit: SubmitHandler<POFormType> = (values) => {
    startTransition(async () => {
      try {
        const payload = {
          ...values,
          poAmount: Number(values.poAmount),
          // clientId: 1,
          createdByUserId: Number(values.createdByUserId),
          startFrom: new Date(values.startFrom),
          endDate: new Date(values.endDate),
        };

        if (update && data?.id) {
          await updatePurchaseOrder(data.id, payload);
          toast.success("Purchase Order updated successfully");
        } else {
          await createPurchaseOrder(payload);
          toast.success("Purchase Order created successfully");
        }

        router.push("/admin/purchase-orders");
      } catch (err) {
        console.error(err);
        toast.error("Failed to save Purchase Order");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: PO Number & Service Type */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="poNumber"
            render={({ field }: { field: ControllerRenderProps<POFormType, "poNumber"> }) => (
              <FormItem>
                <FormLabel>PO Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PO Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }: { field: ControllerRenderProps<POFormType, "serviceType"> }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Service Type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Start Date & End Date */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startFrom"
            render={({ field }: { field: ControllerRenderProps<POFormType, "startFrom"> }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }: { field: ControllerRenderProps<POFormType, "endDate"> }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Contract Type & Contract Duration */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contractType"
            render={({ field }: { field: ControllerRenderProps<POFormType, "contractType"> }) => (
              <FormItem>
                <FormLabel>Contract Type</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Contract Type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contractDuration"
            render={({ field }: { field: ControllerRenderProps<POFormType, "contractDuration"> }) => (
              <FormItem>
                <FormLabel>Contract Duration</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Contract Duration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Payment Terms & Billing Plan */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }: { field: ControllerRenderProps<POFormType, "paymentTerms"> }) => (
              <FormItem>
                <FormLabel>Payment Terms</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Payment Terms" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingPlan"
            render={({ field }: { field: ControllerRenderProps<POFormType, "billingPlan"> }) => (
              <FormItem>
                <FormLabel>Billing Plan</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Billing Plan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5: PO Amount & Stat */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="poAmount"
            render={({ field }: { field: ControllerRenderProps<POFormType, "poAmount"> }) => (
              <FormItem>
                <FormLabel>PO Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Enter PO Amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: ControllerRenderProps<POFormType, "status"> }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select {...field} className="border rounded px-3 py-2 w-full">
                    {Object.values(Status).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        {/* Remark (full width) */}
        <FormField
          control={form.control}
          name="remark"
          render={({ field }: { field: ControllerRenderProps<POFormType, "remark"> }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes" className="h-32" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {update ? "Update PO" : "Create PO"}
          </Button>
        </div>
      </form>
    </Form >
  );
};

export default POForm;