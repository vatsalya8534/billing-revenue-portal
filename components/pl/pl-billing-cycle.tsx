"use client";

import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { AccordionItem, AccordionContent, AccordionTrigger } from "../ui/accordion";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { useFieldArray } from "react-hook-form";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface OtherCost {
  key: string;
  value: number | string;
}

interface BillingCycleField {
  month?: number;
  year?: number;
  billedAmount: number;
  otherCost: OtherCost[];
}

interface PLBillingCycleProps {
  field: BillingCycleField;
  index: number;
  form: {
    control: any; // react-hook-form control object
    watch: any;
  } | null;
}

const PLBillingCycle = ({ field, index, form }: PLBillingCycleProps) => {
  if (!form) {
    // If form is undefined, render fallback
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
  const hasInitialized = useRef(false);

  const { fields: otherFields, append, remove } = useFieldArray({
    control: form.control,
    name: `billingCycle.${index}.otherCost`,
  });

  const addMiscellaneousAmount = () => append({ key: "", value: 0 });

  const otherBills: OtherCost[] = form.watch(`billingCycle.${index}.otherCost`) || [];
  const billedAmount: number = form.watch(`billingCycle.${index}.billedAmount`) || 0;

  useEffect(() => {
    if (otherBills.length > 0) {
      const totalAmount = otherBills.reduce((sum, bill) => sum + Number(bill.value || 0), 0);
      setTotalOtherBillAmount(totalAmount);
      const gmPercent = billedAmount > 0 ? (totalAmount / billedAmount) * 100 : 0;
      setMonthlyGMPercentage(Number(gmPercent.toFixed(2)));
    } else {
      setTotalOtherBillAmount(0);
      setMonthlyGMPercentage(0);
    }

    if (!hasInitialized.current && field?.otherCost) {
      hasInitialized.current = true;
      let otherCostData: OtherCost[] = [];

      if (typeof field.otherCost === "string") {
        try {
          otherCostData = JSON.parse(field.otherCost);
        } catch {
          console.error("Invalid JSON in otherCost:", field.otherCost);
        }
      } else {
        otherCostData = field.otherCost;
      }

      if (otherCostData.length > 0) append(otherCostData);
    }
  }, [JSON.stringify(otherBills), billedAmount, append, field.otherCost]);

  return (
    <AccordionItem value={`billing-cycle-${index}`}>
      <AccordionTrigger>
        {monthName} {year}
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <FormField
              control={form.control}
              name={`billingCycle.${index}.billedAmount`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter Billing Amount" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <div className="flex justify-between items-center">
              <h2>Total Other Bill Amount: ₹{totalOtherBillAmount.toLocaleString()}</h2>
              <h2>Monthly GM%: {monthlyGMPercentage}%</h2>
              <Button type="button" variant="default" onClick={addMiscellaneousAmount}>
                Add Miscellaneous Amount
              </Button>
            </div>

            {otherFields.map((field, ind) => (
              <Card key={ind}>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`billingCycle.${index}.otherCost.${ind}.key`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter Key" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input type="number" placeholder="Enter Value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PLBillingCycle;