"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import moment from "moment";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import BillingCycleForm from "./billing-cycle-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Calendar } from "../ui/calendar";
import { Loader2, ArrowRight, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { purchaseOrderSchema } from "@/lib/validators";
import { createPurchaseOrder, updatePurchaseOrder } from "@/lib/actions/purschase-order";
import { PurchaseOrder, POStatus, PaymentReceived } from "@prisma/client";
import { BillingCycle, BillingPlan, ContractDuration, ContractType, Customer, ServiceType } from "@/types";
import z from "zod";

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

const POForm = ({
  billingPlan,
  serviceType,
  contractType,
  customers,
  data,
  update = false,
  contractDurations
}: {
  billingPlan: BillingPlan[];
  serviceType: ServiceType[];
  contractType: ContractType[];
  customers: Customer[];
  data?: any;
  update: boolean;
  contractDurations: ContractDuration[];
}) => {
  const router = useRouter();
  const id = data?.id;

  // ---------------- DEFAULT VALUES ----------------
  const defaultValues: PurchaseOrderFormValues = {
    customerPONumber: "",
    poAmount: 0,
    serviceTypeId: "",
    contractDurationId: "",
    contractId: "",
    paymentTerms: "",
    billingPlanId: "",
    customerId: "",
    poOwner: "",
    status: POStatus.LIVE,

    startFrom: undefined,
    endDate: undefined,
    ageingDays: 0,
    br: undefined,

    remark: "",
    others: "",
    scope: "",
    tds: "",
    billingCycles: []
  };

  // ---------------- FORM ----------------
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema) as any,
    defaultValues
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "billingCycles"
  });

  // ---------------- WATCHERS ----------------
  const watchBillingPlan = form.watch("billingPlanId");
  const watchPOAmount = form.watch("poAmount");
  const startFrom = form.watch("startFrom");
  const endDate = form.watch("endDate"); // ✅ FIXED
  const contractDurationId = form.watch("contractDurationId");

  // ---------------- STATE ----------------
  const [contractDurationData, setContractDurationData] =
    useState<ContractDuration | null>(null);

  const [isPending, startTransition] = React.useTransition();

  // ---------------- BILLING CYCLE GENERATOR ----------------
  const addBillingCycle = (
    amount: number,
    index: number,
    totalBillingCycles: number
  ) => {
    if (!startFrom) return;

    const startDate = moment(startFrom);

    const gap =
      (contractDurationData?.totalNumberOfMonths ?? totalBillingCycles) /
      totalBillingCycles;

    const date = startDate.clone().add(index * gap, "months").toDate();

    return {
      billingSubmittedDate: date,
      paymentReceived: PaymentReceived.NO,
      paymentReceivedDate: null,
      paymentDuedate: date,
      billingRemark: "",
      invoiceNumber: "",
      invoiceAmount: amount,
      collectedamount: 0,
      invoiceDate: date
    };
  };

  // ---------------- AGEING CALCULATION ----------------
  useEffect(() => {
    if (startFrom && endDate) {
      const days = moment(endDate).diff(moment(startFrom), "days");

      form.setValue("ageingDays", days >= 0 ? days : 0);
    } else {
      form.setValue("ageingDays", 0);
    }
  }, [startFrom, endDate, form]);

  // ---------------- SUBMIT ----------------
  const onSubmit: SubmitHandler<PurchaseOrderFormValues> = (values) => {
    startTransition(async () => {
      const res =
        update && id
          ? await updatePurchaseOrder(values, id)
          : await createPurchaseOrder(values);

      if (!res?.success) {
        toast.error("Error", { description: res?.message });
      } else {
        router.push("/admin/purchase-orders");
      }
    });
  };

  // ---------------- AUTO BILLING CYCLES ----------------
  useEffect(() => {
    if (!update && watchBillingPlan && watchPOAmount && startFrom) {
      const bp = billingPlan.find((b) => b.id === watchBillingPlan);
      if (!bp) return;

      const cycles = Array.from({ length: bp.totalBillingCycles }, (_, i) =>
        addBillingCycle(
          Number(watchPOAmount) / bp.totalBillingCycles,
          i,
          bp.totalBillingCycles
        )
      ).filter(Boolean) as NonNullable<
        ReturnType<typeof addBillingCycle>
      >[];

      form.setValue("billingCycles", cycles);
    }

    if (startFrom && contractDurationId) {
      const cd = contractDurations.find((c) => c.id === contractDurationId);
      if (cd) setContractDurationData(cd);
    }
  }, [watchBillingPlan, watchPOAmount, startFrom, contractDurationId, update]);

  // ---------------- UPDATE MODE ----------------
  useEffect(() => {
    if (!update || !data) return;

    const formattedCycles = (data.billingCycles ?? []).map((bc : any) => ({
      invoiceNumber: bc.invoiceNumber ?? "",
      invoiceAmount: Number(bc.invoiceAmount ?? 0),
      collectedAmount: Number(bc.collectedamount ?? 0),

      invoiceDate: bc.invoiceDate ? new Date(bc.invoiceDate) : undefined,
      billingSubmittedDate: bc.billingSubmittedDate
        ? new Date(bc.billingSubmittedDate)
        : undefined,
      paymentReceivedDate: bc.paymentReceivedDate
        ? new Date(bc.paymentReceivedDate)
        : undefined,
      paymentDueDate: bc.paymentDuedate
        ? new Date(bc.paymentDuedate)
        : undefined,

      paymentReceived: bc.paymentReceived,
      billingRemark: bc.billingRemark ?? ""
    }));

    form.reset({
      ...defaultValues,

      customerPONumber: data.customerPONumber ?? "",
      poAmount: Number(data.poAmount ?? 0),

      // ✅ IMPORTANT: force string for Select fields
      serviceTypeId: String(data.serviceTypeId ?? ""),
      contractDurationId: String(data.contractDurationId ?? ""),
      contractId: String(data.contractId ?? ""),
      billingPlanId: String(data.billingPlanId ?? ""),
      customerId: String(data.customerId ?? ""),

      paymentTerms: data.paymentTerms ?? "",
      poOwner: data.poOwner ?? "",
      status: data.status,

      startFrom: data.startFrom ? new Date(data.startFrom) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      ageingDays: Number(data.ageingDays ?? 0),
      br: data.br ? new Date(data.br) : undefined,

      remark: data.remark ?? "",
      others: data.others ?? "",
      scope: data.scope ?? "",
      tds: data.tds ?? "",

      billingCycles: formattedCycles ?? []
    });

    // ✅ sync field array
    replace(formattedCycles);

  }, [data, update, form, replace]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          onSubmit,
          (errors) => {
            console.log("FORM ERRORS:", errors);
            toast.error("Validation failed");
          }
        )}
        className="space-y-6"
      >
        {/* --- Row 1: PO Number & Service Type --- */}
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
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {serviceType.map((service) => (
                          <SelectItem
                            key={service.id}
                            value={String(service.id)}
                          >
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contract Duration */}
          <FormField
            control={form.control}
            name="contractDurationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Duration</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Contract Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {contractDurations.map((contract) => (
                          <SelectItem
                            key={contract.id}
                            value={String(contract.id)}
                          >
                            {contract.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Contract Type */}
          <FormField
            control={form.control}
            name="contractId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Contract Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {contractType.map((contract) => (
                          <SelectItem
                            key={contract.id}
                            value={String(contract.id)}
                          >
                            {contract.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Start Date */}
          <FormField
            control={form.control}
            name="startFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={field.onChange}
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
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField control={form.control} name="others" render={({ field }) => (
            <FormItem>
              <FormLabel>Others</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="scope" render={({ field }) => (
            <FormItem>
              <FormLabel>Scope</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="tds" render={({ field }) => (
            <FormItem>
              <FormLabel>TDS</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField
            control={form.control}
            name="ageingDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ageing Days</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? 0}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* BR */}
          <FormField control={form.control} name="br" render={({ field }) => (
            <FormItem>
              <FormLabel>BR</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value as Date} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

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
            name="poOwner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO Owner</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PO Owner" {...field} />
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
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Billing Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {billingPlan.map((bp) => (
                          <SelectItem
                            key={bp.id}
                            value={String(bp.id)}
                          >
                            {bp.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* --- Billing Cycles --- */}
        {fields.map((field, index) => (
          <BillingCycleForm key={field.id} index={index} control={form.control} />
        ))}

        {/* --- Customer & Status --- */}
        <div className="grid grid-cols-2 gap-4">
          {/* Customer */}
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {customers.map((customer) => (
                          <SelectItem
                            key={customer.id}
                            value={String(customer.id)}
                          >
                            {customer.firstName + " " + customer.lastName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(POStatus).map((status) => (
                          <SelectItem value={status} key={status}>
                            {status}
                          </SelectItem>
                        ))}
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
        </div>

        {/* --- Submit Button --- */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {update ? "Update PO" : "Create PO"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default POForm;