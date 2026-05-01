"use client";

import { z } from "zod";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { projectMonthlyPLSchema, projectSchema } from "@/lib/validators";

interface OtherCost {
  key: string;
  value: number | string;
}

type BillingCycleField = z.infer<typeof projectMonthlyPLSchema>;

interface PLBillingCycleProps {
  field: BillingCycleField;
  index: number;
  form: UseFormReturn<z.infer<typeof projectSchema>>;
}

const PLBillingCycle = ({ field, index, form }: PLBillingCycleProps) => {
  const monthIndex = Number(field?.month ?? 0);
  const year = Number(field?.year ?? new Date().getFullYear());

  const monthName = new Date(year, monthIndex).toLocaleString("en-IN", {
    month: "long",
  });

  const { fields: otherFields, append, remove } = useFieldArray({
    control: form.control,
    name: `billingCycle.${index}.otherCost`,
  });

  const billedAmount = Number(form.watch(`billingCycle.${index}.billedAmount`) || 0);
  const fmsAmount = Number(form.watch(`billingCycle.${index}.fms`) || 0);
  const spareAmount = Number(form.watch(`billingCycle.${index}.spare`) || 0);
  const watchedOtherCost = form.watch(`billingCycle.${index}.otherCost`);

  const otherBills: OtherCost[] = Array.isArray(watchedOtherCost)
    ? watchedOtherCost
    : [];
  const miscTotal = otherBills.reduce(
    (sum, item) => sum + Number(item?.value || 0),
    0,
  );
  const totalCost = miscTotal + fmsAmount + spareAmount;
  const gmPercentage = Number(
    (
      billedAmount > 0
        ? ((billedAmount - totalCost) / billedAmount) * 100
        : 0
    ).toFixed(2),
  );

  const addMiscellaneousAmount = () => {
    append({ key: "", value: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {monthName} {year}
          </h2>
        </div>

        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <span>Total Cost: Rs.{totalCost.toLocaleString()}</span>
          <span>GM: Rs.{(billedAmount - totalCost).toLocaleString()}</span>
          <span>GM%: {gmPercentage}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`billingCycle.${index}.billableAmount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billable Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`billingCycle.${index}.resourceUsed`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Used</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`billingCycle.${index}.billedAmount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billed Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`billingCycle.${index}.fms`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>FMS</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`billingCycle.${index}.spare`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Spare</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Other Costs</h3>
          <Button type="button" onClick={addMiscellaneousAmount}>
            Add Other Cost
          </Button>
        </div>

        {otherFields.length === 0 && (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            Click &quot;Add Other Cost&quot; No other cost added.
          </div>
        )}

        <div className="space-y-3">
          {otherFields.map((item, ind) => (
            <Card key={item.id}>
              <CardContent className="pt-5">
                <div className="grid items-end gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`billingCycle.${index}.otherCost.${ind}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cost Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`billingCycle.${index}.otherCost.${ind}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(ind)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PLBillingCycle;
