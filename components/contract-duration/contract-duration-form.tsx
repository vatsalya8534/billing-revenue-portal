"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

import { contractDurationSchema } from "@/lib/validators";
import { billingPlanDefaultValues, contractDurationDefaultValues } from "@/lib/constants";
import { Status } from "@prisma/client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { ContractDuration } from "@/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { createContractDuration, updateContractDuration } from "@/lib/actions/contract-duration";

type BillingCycleFormValues = z.infer<typeof contractDurationSchema>

const ContractDurationForm = ({ data, update = false }: { data?: ContractDuration; update: boolean; }) => {
  const router = useRouter();
  const id = data?.id;

  const form = useForm<BillingCycleFormValues>({
    resolver: zodResolver(contractDurationSchema) as any,
    defaultValues: data || contractDurationDefaultValues,
  });

  const [isPending, startTransition] = React.useTransition();

  const onSubmit: SubmitHandler<z.infer<typeof contractDurationSchema>> = (values: any) => {
    startTransition(async () => {
      let res;

      const payload = {
        ...values,
      };

      if (update && id) {
        res = await updateContractDuration(payload, id);
      } else {
        res = await createContractDuration(payload);
      }

      if (!res?.success) {
        toast.error("Error", {
          description: res?.message,
        });
      } else {
        router.push("/admin/contract-duration");
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
                <FormLabel>Contract Duration Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Contract Duration name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="totalNumberOfMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Billing Cycles</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter total billing cycles" {...field} />
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
            Save Contract Duration
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContractDurationForm;