"use client";

import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "../ui/accordion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

interface OtherCost {
  key: string;
  value: number | string;
}

interface BillingCycleField {
  month?: number;
  year?: number;
  billedAmount: number;
  billableAmount: number;
  resourceUsed: number;
  otherCost: OtherCost[] | string;
}

interface PLBillingCycleProps {
  field: BillingCycleField;
  index: number;
  form: {
    control: any;
    watch: any;
  } | null;
}

const PLBillingCycle = ({ field, index, form }: PLBillingCycleProps) => {
  if (!form) {
    return (
      <AccordionItem value={`billing-cycle-${index}`}>
        <AccordionTrigger>Data not available</AccordionTrigger>
        <AccordionContent>
          <p className="text-red-500">Form control is missing</p>
        </AccordionContent>
      </AccordionItem>
    );
  }

  const monthIndex = field?.month ?? 0;
  const year = field?.year ?? new Date().getFullYear();
  const monthName = moment().month(monthIndex).format("MMMM");

  const [totalOtherBillAmount, setTotalOtherBillAmount] = useState(0);
  const [monthlyGMPercentage, setMonthlyGMPercentage] = useState(0);

  const initialized = useRef(false);

  const {
    fields: otherFields,
    append,
    replace,
    remove,
  } = useFieldArray({
    control: form.control,
    name: `billingCycle.${index}.otherCost`,
  });

  const billedAmount = Number(
    form.watch(`billingCycle.${index}.billedAmount`) || 0,
  );
  const fmsAmount = Number(form.watch(`billingCycle.${index}.fms`) || 0);
  const spareAmount = Number(form.watch(`billingCycle.${index}.spare`) || 0);

  let otherBills: OtherCost[] =
    form.watch(`billingCycle.${index}.otherCost`) || [];

  if (typeof otherBills === "string") {
    try {
      otherBills = JSON.parse(otherBills);
    } catch {
      otherBills = [];
    }
  }

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      let initialData: OtherCost[] = [];

      if (typeof field.otherCost === "string") {
        try {
          initialData = JSON.parse(field.otherCost);
        } catch {
          initialData = [];
        }
      } else {
        initialData = field.otherCost || [];
      }

      if (initialData.length > 0) {
        replace(initialData);
      }
    }
  }, [field.otherCost, replace]);

  useEffect(() => {
    if (typeof otherBills === "string") return;

    const otherTotal = otherBills.reduce(
      (sum, bill) => sum + Number(bill?.value || 0),
      0,
    );

    const total = otherTotal + fmsAmount + spareAmount;
    setTotalOtherBillAmount(total);

    const gm =
      billedAmount > 0 ? ((billedAmount - total) / billedAmount) * 100 : 0;

    setMonthlyGMPercentage(Number(gm.toFixed(2)));
  }, [JSON.stringify(otherBills), billedAmount, fmsAmount, spareAmount]);

  const addMiscellaneousAmount = () => {
    append({ key: "", value: 0 });
  };

  return (
    <AccordionItem value={`billing-cycle-${index}`}>
      <AccordionTrigger>
        {monthName} {year}
      </AccordionTrigger>

      <AccordionContent>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            disabled
            name={`billingCycle.${index}.billableAmount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billable Amount</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
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
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`billingCycle.${index}.spare`}
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Spare</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          

          <div className="col-span-2 space-y-2">
            <div className="flex justify-between items-center">
              <h2>Total: ₹{totalOtherBillAmount.toLocaleString()}</h2>
              <h2>GM%: {monthlyGMPercentage}%</h2>

              <Button type="button" onClick={addMiscellaneousAmount}>
                Add Misc
              </Button>
            </div>

            {otherFields.map(
              (item, ind) =>
                "key" in item && (
                  <Card key={item.id}>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`billingCycle.${index}.otherCost.${ind}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key</FormLabel>
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
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="mt-2 flex justify-end">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => remove(ind)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ),
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PLBillingCycle;
