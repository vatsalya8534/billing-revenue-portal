"use client";

import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react'
import { AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { useFieldArray } from 'react-hook-form';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const PLBillingCycle = ({ field, index, form }: any) => {

    const monthName = moment().month(field.month).format("MMMM");
    const [totalOtherBillAmount, setTotalOtherBillAmount] = useState(0);
    const [monthlyGMPercentage, setmonthlyGMPercentage] = useState(0);

    const hasInitialized = useRef(false);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `billingCycle.${index}.otherCost`
    });

    const addMiscellaneousAmount = () => {
        append({
            key: "",
            value: "",
        });
    }

    let otherBills = form.watch(`billingCycle.${index}.otherCost`) || [];

    let billedAmount = form.watch(`billingCycle.${index}.billedAmount`)

    useEffect(() => {
        if (otherBills && otherBills.length > 0) {
            let totalAmount = 0;

            for (const bill of otherBills) {
                totalAmount += Number(bill.value);
            }

            let mPercentage = (totalAmount/billedAmount) * 100;
            
            setmonthlyGMPercentage(mPercentage)

            setTotalOtherBillAmount(totalAmount);
        }

        if (!hasInitialized.current && field.otherCost) {
            hasInitialized.current = true;
            let otherCostData: any[] = [];

            if (typeof field.otherCost === "string") {
                try {
                    otherCostData = JSON.parse(field.otherCost);
                } catch (e) {
                    console.error("Invalid JSON:", field.otherCost);
                }
            } else {
                otherCostData = field.otherCost;
            }

            if (otherCostData.length > 0) {
                append(otherCostData);
            }
        }

    }, [JSON.stringify(otherBills), billedAmount]);

    return (
        <AccordionItem key={index} value={`billing-cycle-${index}`}>
            <AccordionTrigger>{monthName + " " + field.year}</AccordionTrigger>
            <AccordionContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className='space-y-2 col-span-2'>
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
                    <div className='space-y-2 col-span-2'>
                        <div className='flex justify-between'>
                            <h2>Total Other Bill Amount : {totalOtherBillAmount}</h2>
                            <h2>Monthly GM% : {monthlyGMPercentage} %</h2>
                            <Button type='button' variant="default" onClick={addMiscellaneousAmount}>Add Miscellaneous Amount</Button>
                        </div>
                        {
                            fields.map((field, ind) => (
                                <Card key={ind}>
                                    <CardContent>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
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
                                            </div>

                                            <div className='space-y-2'>
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
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        }

                    </div>
                </div>

            </AccordionContent>
        </AccordionItem>
    )
}

export default PLBillingCycle