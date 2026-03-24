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
import { BillingCycle, BillingPlan, Company, ContractDuration, ContractType, Customer, ServiceType } from "@/types";
import z from "zod";

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

interface Billing {
  name: string; // Monthly, Quarterly, Yearly, etc.
  totalBillingCycles: number;
  gapInMonths: number; // dynamically define gap per cycle
  billingCycleType: "Start" | "Mid" | "End"; // default for this plan
}

const POForm = ({
  billingPlan,
  serviceType,
  contractType,
  customers,
  companies,
  data,
  update = false,
  contractDurations
}: {
  billingPlan: BillingPlan[];
  serviceType: ServiceType[];
  contractType: ContractType[];
  customers: Customer[];
  companies: Company[];
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

    remark: "",
    scope: "",
    billingCycles: [],
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
    plan: Billing,              
    startFrom: Date | string,
    paymentDueInput?: Date | string
  ) => {
    if (!startFrom) return;

    const start = moment(startFrom);

    // 1️⃣ Dynamic invoice date based on plan.gapInMonths
    let invoiceDate = start.clone().add(plan.gapInMonths * index, "months");

    // 2️⃣ Apply Start / Mid / End for this cycle
    let billingSubmittedDate: moment.Moment;
    switch (plan.billingCycleType) {
      case "Start":
        billingSubmittedDate = invoiceDate.clone().startOf("month");
        invoiceDate = invoiceDate.clone().startOf("month");
        break;
      case "Mid":
        billingSubmittedDate = invoiceDate.clone().date(15);
        invoiceDate = invoiceDate.clone().date(15);
        break;
      case "End":
        billingSubmittedDate = invoiceDate.clone().startOf("month");
        invoiceDate = invoiceDate.clone().endOf("month");
        break;
      default:
        billingSubmittedDate = invoiceDate.clone();
    }

    // 3️⃣ Payment due date can be user input, else +1 month
    const paymentDueDate = paymentDueInput
      ? moment(paymentDueInput).toDate()
      : invoiceDate.clone().add(1, "month").toDate();

    return {
      invoiceDate: invoiceDate.toDate(),
      billingSubmittedDate: billingSubmittedDate.toDate(),
      paymentDueDate,
      invoiceAmount: amount,
      paymentReceived: PaymentReceived.NO,
      paymentReceivedDate: null,
      collectedAmount: 0,
      tds: "",
      billingRemark: "",
      invoiceNumber: "",
    };
  };


  // ---------------- AGEING CALCULATION ----------------
  useEffect(() => {
    if (startFrom && endDate) {
      const days = moment(endDate).diff(moment(startFrom), "days") + 1;

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
      // Find the selected billing plan
      const bp = billingPlan.find((b) => b.id === watchBillingPlan);
      if (!bp) return;

      const paymentDueInput = form.getValues("paymentDueDate" as any) as Date | undefined;
      

      
      const cycles = Array.from(
        { length: bp.totalBillingCycles || 1 },
        (_, i) =>
          addBillingCycle(
            Math.round((Number(watchPOAmount) / (bp.totalBillingCycles || 1)) * 100) / 100,
            i,
            bp,              
            startFrom,
            paymentDueInput
          )
      ).filter(Boolean) as NonNullable<ReturnType<typeof addBillingCycle>>[];

      form.setValue("billingCycles", cycles);
    }
  }, [watchBillingPlan, watchPOAmount, startFrom, update]);


  // ---------------- UPDATE MODE ----------------
  useEffect(() => {
    if (!update || !data) return;

    const formattedCycles = (data.billingCycles ?? []).map((bc: any) => ({
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

      serviceTypeId: String(data.serviceTypeId ?? ""),
      contractDurationId: String(data.contractDurationId ?? ""),
      companyId: String(data.companyId ?? ""),
      contractId: String(data.contractId ?? ""),
      billingPlanId: String(data.billingPlanId ?? ""),
      customerId: String(data.customerId ?? ""),

      paymentTerms: data.paymentTerms ?? "",
      poOwner: data.poOwner ?? "",
      status: data.status,

      startFrom: data.startFrom ? new Date(data.startFrom) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      ageingDays: Number(data.ageingDays ?? 0),


      remark: data.remark ?? "",
      scope: data.scope ?? "",

      billingCycles: formattedCycles ?? []
    });

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

          {/* Company */}
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {companies && companies.length > 0 ? (
                          companies.map((company) => (
                            <SelectItem key={company.id} value={String(company.id)}>
                              {company.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem key="loading" value="loading" disabled>
                            Loading companies...
                          </SelectItem>
                        )}
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

          <FormField control={form.control} name="scope" render={({ field }) => (
            <FormItem>
              <FormLabel>Scope</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField
            control={form.control}
            name="ageingDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Days</FormLabel>
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