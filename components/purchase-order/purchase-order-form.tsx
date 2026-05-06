"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler, useWatch } from "react-hook-form";
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
import {
  themedFieldClassName,
  themedInputClassName,
  themedLabelClassName,
  themedSectionClassName,
  themedSelectTriggerClassName,
  themedSubmitButtonClassName,
  themedTabTriggerClassName,
  themedTabsListClassName,
  themedTextareaClassName,
} from "@/components/ui/form-theme";

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
import { Card, CardContent } from "../ui/card";
import {
  formatBillingCycleLabel,
  generatePurchaseOrderBillingCycles,
} from "@/lib/billing-cycle-utils";

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

const dateButtonClassName = (hasValue?: boolean) =>
  cn(
    themedSelectTriggerClassName,
    "justify-start text-left font-normal",
    !hasValue && "text-muted-foreground",
  );

const formCardClassName =
  "overflow-hidden rounded-2xl border border-sky-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,252,255,0.95))] shadow-[0_24px_70px_-40px_rgba(15,23,42,0.24)] transition-all duration-200 hover:shadow-[0_28px_74px_-36px_rgba(14,165,233,0.22)]";

type PurchaseOrderBillingCycle =
  PurchaseOrderFormValues["billingCycles"][number];

const getCycleMonthYear = (cycle?: PurchaseOrderBillingCycle) => {
  const cycleDate = cycle?.invoiceDate ?? cycle?.billingSubmittedDate;

  if (!cycleDate) return null;

  const value = new Date(cycleDate);

  if (Number.isNaN(value.getTime())) return null;

  return {
    month: value.getMonth(),
    year: value.getFullYear(),
  };
};

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

  const [selectedCycleIndex, setSelectedCycleIndex] = useState(0);

  // ---------------- WATCHERS ----------------
  const watchBillingPlan = form.watch("billingPlanId");
  const watchPOAmount = form.watch("poAmount");
  const startFrom = form.watch("startFrom");
  const endDate = form.watch("endDate");
  const watchedBillingCycles =
    useWatch({
      control: form.control,
      name: "billingCycles",
    }) ?? [];
  const activeCycleIndex =
    fields.length === 0
      ? 0
      : Math.min(selectedCycleIndex, fields.length - 1);

  const [isPending, startTransition] = React.useTransition();

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

  useEffect(() => {
    if (selectedCycleIndex > fields.length - 1) {
      setSelectedCycleIndex(Math.max(fields.length - 1, 0));
    }
  }, [fields.length, selectedCycleIndex]);

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
        router.push("/admin/revenue");
      }
    });
  };

  // ---------------- AUTO BILLING CYCLES ----------------
  useEffect(() => {
    if (update) return;
    if (!watchBillingPlan || !watchPOAmount || !startFrom || !endDate) return;

    const start = moment(startFrom);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) {
      return;
    }

    const selectedPlan = billingPlan.find(
      (value) => value.id === watchBillingPlan,
    );

    if (!selectedPlan) return;

    const intervalMonths = Math.max(
      Number(selectedPlan.totalBillingCycles || 1),
      1,
    );
    const generatedCycles = generatePurchaseOrderBillingCycles({
      startDate: start.toDate(),
      endDate: end.toDate(),
      intervalMonths,
      type: selectedPlan.billingCycleType,
    });
    const perCycleAmount =
      generatedCycles.length > 0
        ? Math.round((Number(watchPOAmount) / generatedCycles.length) * 100) / 100
        : 0;
    const existingCycles = form.getValues("billingCycles") ?? [];

    const cycles = generatedCycles.map((cycleDates) => {
      const targetDate = cycleDates.invoiceDate ?? cycleDates.billingSubmittedDate;
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();
      const existingCycle = existingCycles.find((cycle) => {
        const monthYear = getCycleMonthYear(cycle);

        return (
          monthYear?.month === targetMonth &&
          monthYear?.year === targetYear
        );
      });

      return {
        id: existingCycle?.id,
        invoiceNumber: existingCycle?.invoiceNumber ?? "",
        invoiceAmount: Number(existingCycle?.invoiceAmount ?? perCycleAmount),
        collectedAmount: Number(existingCycle?.collectedAmount ?? 0),
        invoiceDate: existingCycle?.invoiceDate ?? cycleDates.invoiceDate,
        billingSubmittedDate:
          existingCycle?.billingSubmittedDate ?? cycleDates.billingSubmittedDate,
        paymentReceived: existingCycle?.paymentReceived ?? PaymentReceived.NO,
        paymentReceivedDate: existingCycle?.paymentReceivedDate ?? null,
        paymentDueDate: existingCycle?.paymentDueDate ?? null,
        billingRemark: existingCycle?.billingRemark ?? "",
        tds: Number(existingCycle?.tds ?? 0),
      };
    });

    replace(cycles);
  }, [
    billingPlan,
    endDate,
    form,
    replace,
    startFrom,
    update,
    watchBillingPlan,
    watchPOAmount,
  ]);

  // ---------------- UPDATE MODE ----------------
  useEffect(() => {
    if (!update || !data) return;

    const formattedCycles = (data.billingCycles ?? []).map((bc: any) => {
      return {
        id: bc.id,
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
          <TabsList className={themedTabsListClassName}>
            <TabsTrigger className={themedTabTriggerClassName} value="general">
              General
            </TabsTrigger>
            <TabsTrigger className={themedTabTriggerClassName} value="billing-cycle">
              Billing Cycle
            </TabsTrigger>
          </TabsList>

          {/* ================= GENERAL TAB ================= */}
          <TabsContent value="general" className="mt-6">
            <div className={cn(themedSectionClassName, "grid grid-cols-1 gap-6 md:grid-cols-2")}>
              {/* Customer PO Number */}
              <FormField
                control={form.control}
                name="customerPONumber"
                render={({ field }) => (
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Customer PO Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Customer PO Number"
                        className={themedInputClassName}
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Company</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={themedSelectTriggerClassName}>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>PO Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter PO Amount"
                        className={themedInputClassName}
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Service Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={themedSelectTriggerClassName}>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Contract Duration</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={themedSelectTriggerClassName}>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Contract Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={themedSelectTriggerClassName}>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Start Date</FormLabel>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>End Date</FormLabel>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Scope</FormLabel>
                    <FormControl>
                      <Input className={themedInputClassName} {...field} />
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Contract Days</FormLabel>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Payment Terms</FormLabel>
                    <FormControl>
                      <Input className={themedInputClassName} placeholder="Enter Payment Terms" {...field} />
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>PO Owner</FormLabel>
                    <FormControl>
                      <Input className={themedInputClassName} placeholder="Enter PO Owner" {...field} />
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Billing Plan</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={themedSelectTriggerClassName}>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Customer</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={themedSelectTriggerClassName}>
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
                  <FormItem className={themedFieldClassName}>
                    <FormLabel className={themedLabelClassName}>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className={themedSelectTriggerClassName}>
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
                    <FormLabel className={themedLabelClassName}>Remark</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes"
                        className={themedTextareaClassName}
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
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  {fields.map((field, index) => (
                    <Button
                      key={field.id}
                      type="button"
                      variant={activeCycleIndex === index ? "default" : "outline"}
                      className="min-w-[120px] justify-start px-4"
                      onClick={() => setSelectedCycleIndex(index)}
                    >
                      {formatBillingCycleLabel(
                        watchedBillingCycles[index]?.invoiceDate ??
                          watchedBillingCycles[index]?.billingSubmittedDate,
                      )}
                    </Button>
                  ))}
                </div>

                <Card className={formCardClassName}>
                  <CardContent className="pt-6">
                    <BillingCycleForm
                      key={
                        fields[activeCycleIndex]?.id ??
                        `${activeCycleIndex}-${watchedBillingCycles[activeCycleIndex]?.invoiceDate}-${watchedBillingCycles[activeCycleIndex]?.billingSubmittedDate}`
                      }
                      field={fields[activeCycleIndex]}
                      index={activeCycleIndex}
                      form={form}
                    />
                  </CardContent>
                </Card>
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
            className={themedSubmitButtonClassName}
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
