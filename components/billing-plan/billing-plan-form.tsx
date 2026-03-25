"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

import { billingPlanSchema } from "@/lib/validators";
import { billingPlanDefaultValues } from "@/lib/constants";
import { Status } from "@prisma/client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { BillingPlan } from "@/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { createBillingPlan, updateBillingPlan } from "@/lib/actions/billing-plan";

type BillingCycleFormValues = z.infer<typeof billingPlanSchema>

const BillingPlanForm = ({ data, update = false }: { data?: BillingPlan; update: boolean; }) => {
  const router = useRouter();
  const id = data?.id;

  const form = useForm<BillingCycleFormValues>({
    resolver: zodResolver(billingPlanSchema) as any,
    defaultValues: data
      ? {
        ...data,
        billingCycleType: data.billingCycleType as "START" | "MID" | "END",
      }
      : billingPlanDefaultValues,
  });


  const [isPending, startTransition] = React.useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof billingPlanSchema>> = (values: any) => {
  
    startTransition(async () => {
      let res;

      const payload = {
        ...values,
      };
      

      if (update && id) {
        res = await updateBillingPlan(payload, id);
      } else {
        res = await createBillingPlan(payload);
      }      

      if (!res?.success) {
        toast.error("Error", {
          description: res?.message,
        });
      } else {
        router.push("/admin/billing-plan");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-2 gap-6">
          {/* Role Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing plan Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter billing plan name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingCycleType"
            render={({ field }) => (
            
              <FormItem>
                <FormLabel>Billing Cycle Type</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Cycle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="START">Start</SelectItem>
                      <SelectItem value="MID">Mid</SelectItem>
                      <SelectItem value="END">End</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalBillingCycles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Billing Cycles</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter total billing cycles"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))} // important
                  />
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
                    onValueChange={(v) => field.onChange(v as Status)}
                  >
                    <SelectTrigger className="w-full" {...field}>
                      <SelectValue placeholder="status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={Status.ACTIVE}>Active</SelectItem>
                        <SelectItem value={Status.INACTIVE}>Inactive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Remark */}
        <FormField
          control={form.control}
          name="remark"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea
                  className="h-40"
                  placeholder="Enter Remarks"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Save Billing Plan
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BillingPlanForm;