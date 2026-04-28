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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import BillingCycleForm from "./billing-cycle-form";
import { Calendar } from "../ui/calendar";
import { Loader2, ArrowRight, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { purchaseOrderSchema } from "@/lib/validators";
import {
  createPurchaseOrder,
  updatePurchaseOrder,
} from "@/lib/actions/purschase-order";
import { POStatus, PaymentReceived } from "@prisma/client";
import {
  BillingPlan,
  Company,
  ContractDuration,
  ContractType,
  Customer,
  ServiceType,
} from "@/types";
import z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

interface Billing {
  name: string;
  totalBillingCycles: number;
  gapInMonths: number; // dynamically define gap per cycle
  billingCycleType: "START" | "MID" | "END"; // default for this plan
}

const inputClassName =
  "h-11 rounded-xl border-sky-200/90 bg-white/95 shadow-[0_14px_34px_-24px_rgba(14,165,233,0.5)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.42)] focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-100";

const selectTriggerClassName =
  "h-11 w-full rounded-xl border-sky-200/90 bg-white/95 shadow-[0_14px_34px_-24px_rgba(14,165,233,0.5)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.42)] focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

const dateButtonClassName = (hasValue?: boolean) =>
  cn(
    "h-11 w-full justify-start rounded-xl border-sky-200/90 bg-white/95 text-left font-normal shadow-[0_14px_34px_-24px_rgba(14,165,233,0.5)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.42)] focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-100",
    !hasValue && "text-muted-foreground",
  );

const tabClassName =
  "rounded-xl px-5 py-2.5 font-medium text-slate-600 transition-all duration-200 hover:text-sky-700 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-[0_12px_28px_-18px_rgba(14,165,233,0.45)]";

const formCardClassName =
  "overflow-hidden rounded-2xl border border-sky-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,252,255,0.95))] shadow-[0_24px_70px_-40px_rgba(15,23,42,0.24)] transition-all duration-200 hover:shadow-[0_28px_74px_-36px_rgba(14,165,233,0.22)]";

const fieldItemClassName = "space-y-2.5";
const fieldLabelClassName =
  "text-[0.95rem] font-medium text-slate-700 transition-colors duration-200";

const POForm = ({
  billingPlan,
  serviceType,
  contractType,
  customers,
  companies,
  data,
  update = false,
  contractDurations,
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
    defaultValues: data || defaultValues,
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: "billingCycles",
  });

  const [monthGap, setMonthGap] = useState(0);

  // ---------------- WATCHERS ----------------
  const watchBillingPlan = form.watch("billingPlanId");
  const watchPOAmount = form.watch("poAmount");
  const startFrom = form.watch("startFrom");
  const endDate = form.watch("endDate");

  const [isPending, startTransition] = React.useTransition();

  const addBillingCycle = (
    amount: number,
    index: number,
    plan: Billing | undefined,
    monthGap: number,
    startFrom: Date | string,
    paymentDueInput?: Date | string, // optional
  ) => {
    if (!startFrom || !plan) return;

    const start = moment(startFrom);
    let invoiceDate = start.clone().add(monthGap * index, "months");

    let billingSubmittedDate: moment.Moment;
    switch (plan.billingCycleType) {
      case "START":
        billingSubmittedDate = invoiceDate.clone().startOf("month");
        invoiceDate = invoiceDate.clone().startOf("month");
        break;
      case "MID":
        billingSubmittedDate = invoiceDate.clone().date(15);
        invoiceDate = invoiceDate.clone().date(15);
        break;
      case "END":
        billingSubmittedDate = invoiceDate.clone().startOf("month");
        invoiceDate = invoiceDate.clone().endOf("month");
        break;
      default:
        billingSubmittedDate = invoiceDate.clone();
    }

    return {
      invoiceDate: invoiceDate.toDate(),
      billingSubmittedDate: billingSubmittedDate.toDate(),
      paymentDueDate: paymentDueInput
        ? moment(paymentDueInput).toDate()
        : undefined,
      invoiceAmount: Math.round(amount),
      paymentReceived: PaymentReceived.NO,
      paymentReceivedDate: null,
      collectedAmount: 0,
      tds: 0,
      billingRemark: "",
      invoiceNumber: "",
    };
  };

  useEffect(() => {
    if (!update) {
      if (startFrom && endDate) {
        const days = moment(endDate).diff(moment(startFrom), "days") + 1;

        form.setValue("ageingDays", days >= 0 ? days : 0);
      } else {
        form.setValue("ageingDays", 0);
      }
    }
  }, [startFrom, endDate, form]);

  // ---------------- SUBMIT ----------------
  const onSubmit: SubmitHandler<PurchaseOrderFormValues> = (values) => {
    startTransition(async () => {
      const res =
        update && id
          ? await updatePurchaseOrder(values, id)
          : await createPurchaseOrder(values);

      console.log(res);

      if (!res?.success) {
        toast.error("Error", { description: res?.message });
      } else {
        router.push("/admin/revenue");
      }
    });
  };

  // ---------------- AUTO BILLING CYCLES ----------------
  useEffect(() => {
    if (!update) {
      if (!watchBillingPlan || !watchPOAmount || !startFrom) return;

      const start = moment(startFrom);
      const end = moment(endDate);

      const months = Math.ceil(end.diff(start, "months", true));

      if (!watchBillingPlan) return;

      const bp: any = billingPlan.find(
        (value) => value.id === watchBillingPlan,
      );

      const monthGap = months / (bp?.totalBillingCycles ?? 1);

      setMonthGap(monthGap);

      if (!bp) return;

      const totalCycles = bp.totalBillingCycles || 1;

      const perCycleAmount =
        Math.round((Number(watchPOAmount) / totalCycles) * 100) / 100;

      const cycles = Array.from({ length: totalCycles }, (_, i) =>
        addBillingCycle(perCycleAmount, i, bp, monthGap, startFrom),
      ).filter(Boolean) as NonNullable<ReturnType<typeof addBillingCycle>>[];

      replace(cycles);
    }
  }, [watchBillingPlan, watchPOAmount, startFrom, replace]);

  // ---------------- UPDATE MODE ----------------
  useEffect(() => {
    if (!update || !data) return;

    const formattedCycles = (data.billingCycles ?? []).map((bc: any) => {
      return {
        invoiceNumber: bc.invoiceNumber ?? "",
        invoiceAmount: Number(bc.invoiceAmount ?? 0),
        collectedAmount: Number(bc.collectedAmount ?? 0),

        invoiceDate: bc.invoiceDate ? new Date(bc.invoiceDate) : undefined,
        billingSubmittedDate: bc.billingSubmittedDate
          ? new Date(bc.billingSubmittedDate)
          : undefined,
        paymentReceivedDate: bc.paymentReceivedDate
          ? new Date(bc.paymentReceivedDate)
          : undefined,
        paymentDueDate: bc.paymentDueDate
          ? new Date(bc.paymentDueDate)
          : undefined,
        paymentReceived: bc.paymentReceived,
        billingRemark: bc.billingRemark ?? "",
        tds: bc.tds ?? "",
      };
    });

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

      billingCycles: formattedCycles ?? [],
    });

    replace(formattedCycles);
  }, [data, update, form, replace]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("FORM ERRORS:", errors);
          toast.error("Validation failed");
        })}
        className="space-y-6"
      >
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl md:w-fit">
            <TabsTrigger value="general" >General</TabsTrigger>
            <TabsTrigger value="billing-cycle">Billing Cycle</TabsTrigger>
          </TabsList>

          {/* ================= GENERAL TAB ================= */}
          <TabsContent value="general" className="mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Customer PO Number */}
              <FormField
                control={form.control}
                name="customerPONumber"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Customer PO Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Customer PO Number"
                        className={inputClassName}
                        {...field}
                      />
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
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Company</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select Company" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {companies.map((company) => (
                              <SelectItem
                                key={company.id}
                                value={String(company.id)}
                              >
                                {company.name}
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

              {/* PO Amount */}
              <FormField
                control={form.control}
                name="poAmount"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>PO Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter PO Amount"
                        className={inputClassName}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Service Type */}
              <FormField
                control={form.control}
                name="serviceTypeId"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Service Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
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
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Contract Duration</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
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
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Contract Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
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
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Start Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={dateButtonClassName(!!field.value)}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
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

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>End Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={dateButtonClassName(!!field.value)}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
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

              {/* Scope */}
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Scope</FormLabel>
                    <FormControl>
                      <Input className={inputClassName} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contract Days */}
              <FormField
                control={form.control}
                name="ageingDays"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Contract Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? 0}
                        readOnly
                        className="h-11 rounded-xl border-sky-200/90 bg-white/95 shadow-[0_14px_34px_-24px_rgba(14,165,233,0.5)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.42)] focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-100 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Terms */}
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Payment Terms</FormLabel>
                    <FormControl>
                      <Input className={inputClassName} placeholder="Enter Payment Terms" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PO Owner */}
              <FormField
                control={form.control}
                name="poOwner"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>PO Owner</FormLabel>
                    <FormControl>
                      <Input className={inputClassName} placeholder="Enter PO Owner" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Billing Plan */}
              <FormField
                control={form.control}
                name="billingPlanId"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Billing Plan</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Select Billing Plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {billingPlan.map((bp) => (
                              <SelectItem key={bp.id} value={String(bp.id)}>
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

              {/* Customer */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Customer</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
                          <SelectValue placeholder="Customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {customers.map((customer) => (
                              <SelectItem
                                key={customer.id}
                                value={String(customer.id)}
                              >
                                {customer.firstName} {customer.lastName}
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
                  <FormItem className={fieldItemClassName}>
                    <FormLabel className={fieldLabelClassName}>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={selectTriggerClassName}>
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

              {/* Remark */}
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem className="space-y-2.5 md:col-span-2">
                    <FormLabel className={fieldLabelClassName}>Remark</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
                        className="min-h-[120px] rounded-2xl border-sky-200/90 bg-white/95 shadow-[0_14px_34px_-24px_rgba(14,165,233,0.5)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.42)] focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* ================= BILLING TAB ================= */}
          <TabsContent value="billing-cycle" className="mt-6">
            {fields.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {fields.map((field, index) => (
                  <Card key={field.id} className={formCardClassName}>
                    <CardHeader className="space-y-3 bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.16),_transparent_34%),linear-gradient(180deg,rgba(255,255,255,1),rgba(240,249,255,0.72))]">
                      <CardTitle className="text-xl font-bold text-slate-900">
                        Billing Cycle {index + 1}
                      </CardTitle>

                      <div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-[0_16px_38px_-30px_rgba(14,165,233,0.35)]">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            {moment(
                              form.watch(`billingCycles.${index}.invoiceDate`),
                            ).format("MMMM YYYY")}
                          </h2>

                          <p className="text-sm text-sky-700/80">
                            Billing Cycle #{index + 1}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <BillingCycleForm index={index} control={form.control} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-sky-200 bg-gradient-to-b from-white to-sky-50/70 shadow-[0_20px_52px_-34px_rgba(14,165,233,0.32)]">
                <CardContent className="py-10 text-center text-slate-500">
                  No billing cycles generated yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="h-11 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 px-6 text-white shadow-[0_18px_42px_-18px_rgba(14,165,233,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:from-sky-600 hover:via-sky-700 hover:to-cyan-600 hover:shadow-[0_22px_48px_-16px_rgba(14,165,233,0.62)]"
          >
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
