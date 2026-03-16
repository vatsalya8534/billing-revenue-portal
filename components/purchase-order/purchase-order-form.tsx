"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight, CalendarIcon } from "lucide-react";

import { z } from "zod";
import { PurchaseOrder, POStatus, PaymentReceived } from "@prisma/client";
import { purchaseOrderSchema } from "@/lib/validators";
import { createPurchaseOrder, updatePurchaseOrder } from "@/lib/actions/purschase-order";
import { formatDate } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Calendar } from "../ui/calendar";
import { BillingCycle, BillingPlan, ContractDuration, ContractType, Customer, ServiceType } from "@/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import BillingCycleForm from "./billing-cycle-form";
import moment from "moment"

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

const POForm = ({ billingPlan, serviceType, contractType, customers, billingCycles, data, update = false, contractDurations }: { billingPlan: BillingPlan[], billingCycles: BillingCycle[], serviceType: ServiceType[], contractType: ContractType[], customers: Customer[], data?: PurchaseOrder, update: boolean, contractDurations: ContractDuration[] }) => {
  const router = useRouter();

  const id = data?.id;

  const defaultValue = {
    ...data,
    poAmount: data?.poAmount ?? 0,
    paymentTerms: data?.paymentTerms ?? "",
    customerPONumber: data?.customerPONumber ?? "",
    startFrom: formatDate(data?.startFrom),
    endDate: formatDate(data?.endDate),
    billingPlanId: data?.billingPlanId ?? undefined,
    customerId: data?.customerId ?? undefined,
    remark: data?.remark ?? undefined,
    billingCycle: billingCycles || []
  }

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema) as any,
    defaultValues: defaultValue,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "billingCycle"
  })

  const watchBillingPlan = form.watch("billingPlanId")
  const watchPOAmount = form.watch("poAmount")
  const contractDurationId = form.watch("contractDurationId")
  const startFrom = form.watch("startFrom")

  const addBillingCycle = (amount: any, count: number, totalBillingCycles: number) => {

    console.log(count);


    const startFrom = form.getValues("startFrom")
    const startDate = moment(startFrom)

    const billingMonthGap = contractDurationData.totalNumberOfMonths / totalBillingCycles;


    append({
      billingNumber: "",
      billingAmount: amount,
      billingDate: count > 0 ? startDate.clone().add((count) * billingMonthGap, "months").toDate() : startDate.toDate(),
      billingSubmittedDate: count > 0 ? startDate.clone().add((count) * billingMonthGap, "months").toDate() : startDate.toDate(),
      paymentReceived: PaymentReceived.NO,
      paymentReceivedDate: count > 0 ? startDate.clone().add((count) * billingMonthGap, "months").toDate() : startDate.toDate(),
      paymentReceivedAmount: amount,
      billingRemark: ""
    })
  }

  const [contractDurationData, setContractDurationData] = useState<any>({})

  const [isPending, startTransition] = React.useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof purchaseOrderSchema>> = (values) => {

    startTransition(async () => {
      let res;

      const payload = {
        ...values,
      };

      if (update && id) {
        res = await updatePurchaseOrder(payload, id);
      } else {
        res = await createPurchaseOrder(payload);
      }


      if (!res?.success) {
        toast.error("Error", {
          description: res?.message,
        });
      } else {
        router.push("/admin/purchase-orders");
      }
    });
  };

  useEffect(() => {

    if (!update) {
      if (watchBillingPlan) {
        let currentBillingPlanData = billingPlan.find((value) => value.id === watchBillingPlan);
        if (currentBillingPlanData) {
          for (let count = 0; count < currentBillingPlanData.totalBillingCycles; count++) {
            addBillingCycle(watchPOAmount / currentBillingPlanData.totalBillingCycles, count, currentBillingPlanData.totalBillingCycles)
          }
        }
      }

      if (startFrom) {
        let contractDuration = contractDurations.find((value) => value.id === contractDurationId)
        if (contractDuration) {
          setContractDurationData(contractDuration)
        }

        const startDate = moment(startFrom)
        const result = startDate.clone().add(Number(contractDuration?.totalNumberOfMonths), "months")
        form.setValue("endDate", result.toDate())
      }
    }

  }, [watchBillingPlan, update, contractDurationId, startFrom])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))} className="space-y-6">
        {/* Row 1: PO Number & Service Type */}
        <div className="grid grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="customerPONumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer PO Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Customer PO Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="poAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter PO Amount"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="w-full" {...field}>
                      <SelectValue placeholder="Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {

                          serviceType?.length > 0 && serviceType.map((service, index) => (
                            <SelectItem value={service.id ?? ""} key={index}>{service.name}</SelectItem>
                          ))
                        }

                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractDurationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Duration</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="w-full" {...field}>
                      <SelectValue placeholder="Contact Duration " />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          contractDurations?.length > 0 && contractDurations.map((contract, index) => (
                            <SelectItem value={contract.id ?? ""} key={index}>{contract.name}</SelectItem>
                          ))
                        }

                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Type</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="w-full" {...field}>
                      <SelectValue placeholder="Contact Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          contractType?.length > 0 && contractType.map((contract, index) => (
                            <SelectItem value={contract.id ?? ""} key={index}>{contract.name}</SelectItem>
                          ))
                        }

                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name='startFrom'
            render={({
              field
            }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={(date) => field.onChange(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='endDate'
            render={({
              field
            }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        disabled
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={field.onChange}
                        disabled
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
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
            name="billingPlanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Plan</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="w-full" {...field}>
                      <SelectValue placeholder="Billing plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {

                          billingPlan?.length > 0 && billingPlan.map((billing, index) => (
                            <SelectItem value={billing.id ?? ""} key={index}>{billing.name}</SelectItem>
                          ))
                        }

                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        {fields.map((field, index) => (
          <BillingCycleForm
            key={field.id}
            index={index}
            control={form.control}
          />
        ))}

        <div className="grid grid-cols-2 gap-4" >
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="w-full" {...field}>
                      <SelectValue placeholder="Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {

                          customers?.length > 0 && customers.map((customer, index) => (
                            <SelectItem value={customer.id ?? ""} key={index}>{customer.firstName + " " + customer.lastName}</SelectItem>
                          ))
                        }

                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger className="w-full" {...field}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          Object.values(POStatus).map((status, index) => (
                            <SelectItem value={status} key={index}>{status}</SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="poOwner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Po Owner</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Po Owner" {...field} />
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
          render={({ field }) => (
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