"use client";

import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight, CalendarIcon } from "lucide-react";

import { z } from "zod";
import { Status, OrderType } from "@prisma/client";
import { projectSchema } from "@/lib/validators";
import { plDefaultValues } from "@/lib/constants";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { Calendar } from "../ui/calendar";
import { BillingPlan, Company } from "@/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { createProject, updateProject } from "@/lib/actions/project";
import { Project as ProjectType } from "@/types";
import { useEffect, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import moment from "moment";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import PLBillingCycle from "./pl-billing-cycle";

const PLForm = ({
  billingPlans,
  companies,
  data,
  update = false,
  billingCycles
}: {
  billingPlans: BillingPlan[],
  companies: Company[],
  data?: ProjectType,
  update: boolean,
  billingCycles: any
}) => {
  const router = useRouter();
  const id = data?.id;

  delete data?.createdAt;
  delete data?.updatedAt;

  if(data) {
    data.billingCycle = billingCycles.map((value:any) => {
      delete value.createdAt;
      delete value.updatedAt;
      return value
    })
  }

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues:  data || plDefaultValues,
  });

  const [isPending, startTransition] = useTransition();
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const billingPlanId = form.watch("billingPlanId");


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "billingCycle"
  });

  const addMonthCycle = (month: number, year: number) => {
    append({
      month,
      year,
      billedAmount: 0,
      otherCost: [],
    });
  };

  const onSubmit: SubmitHandler<z.infer<typeof projectSchema>> = (values) => {
    startTransition(async () => {
      let res;
      if (update && id) {
        res = await updateProject(values, id);
      } else {
        res = await createProject(values);
      }

      console.log(res);
      

      if (!res?.success) {
        toast.error("Error", { description: res?.message });
      } else {
        router.push("/admin/pl");
      }
    });
  };

  useEffect(() => {
    const start = moment(startDate);
    const end = moment(endDate);

    const months = Math.ceil(end.diff(start, "months", true));

    const billingPlanData = billingPlans.find((value) => value.id === billingPlanId);

    if (!billingPlanId) return;

    const monthGap = months / (billingPlanData?.totalBillingCycles ?? 1)

    let count = 0;

    while (count < months) {

      const date = moment(start);

      const newDate = date.clone().add(count, "month");

      const monthIndex = newDate.month();
      const year = newDate.year();

      addMonthCycle(monthIndex, year)

      count += monthGap;
    }

  }, [billingPlanId])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))} className="space-y-6">

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="billing-cycle">Billing Cycle</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <div className="grid grid-cols-2 gap-6 mt-5">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="w-full" {...field}>
                          <SelectValue placeholder="Company Name" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {
                              companies?.length > 0 && companies.map((company, index) => (
                                <SelectItem value={company.id ?? ""} key={index}>{company.name}</SelectItem>
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
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>project name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='startDate'
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
                name="poValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Value</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter PO Value" {...field} />
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

                              billingPlans?.length > 0 && billingPlans.map((billing, index) => (
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

              <FormField
                control={form.control}
                name="resourceCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter Resource Count"
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
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        defaultValue={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger className="w-full" {...field}>
                          <SelectValue placeholder="Order type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {
                              Object.values(OrderType).map((status, index) => (
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
                              Object.values(Status).map((status, index) => (
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
            </div>
          </TabsContent>
          <TabsContent value="billing-cycle">
            <Accordion type="single" collapsible defaultValue="billing-cycle-0">
              {fields.map((field, index) => 
                <PLBillingCycle field={field} index={index} key={index} form={form} />
              )}
            </Accordion>
          </TabsContent>
        </Tabs>


        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Save Project
          </Button>
        </div>
      </form>
    </Form >
  );
};

export default PLForm;