"use client"
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PaymentReceived } from '@prisma/client';
import { Textarea } from '../ui/textarea';
import { useEffect, useState } from 'react';
import { Spinner } from '../ui/spinner';

const BillingCycleForm = ({ index, control }: { index: number; control: any }) => {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer); // cleanup
    }, []);

    if(loading) return <div className='h-full w-full flex justify-center items-center'><Spinner className='h-10 w-10' /></div> 

    return (
        <div className='p-4'>
            <div className="grid grid-cols-2 gap-4">
                {/* Billing Number / Invoice Number */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.invoiceNumber`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Invoice Number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Invoice Amount */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.invoiceAmount`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice Amount</FormLabel>
                                <FormControl>
                                    <Input type='number' placeholder="Enter Invoice Amount" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Collected Amount */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.collectedAmount`}
                        render={({ field }) => {
                            
                            return <FormItem>
                                <FormLabel>Collected Amount</FormLabel>
                                <FormControl>
                                    <Input type='number' placeholder="Enter Collected Amount" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        }}
                    />
                </div>

                {/* Invoice Date */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.invoiceDate`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Invoice Date</FormLabel>
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
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={field.value as Date} onSelect={field.onChange} />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Billing Submitted Date */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.billingSubmittedDate`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Submitted Date</FormLabel>
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
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={field.value as Date} onSelect={field.onChange} />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Payment Received */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.paymentReceived`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Received</FormLabel>
                                <FormControl>
                                    <Select defaultValue={field.value} onValueChange={(v) => field.onChange(v)}>
                                        <SelectTrigger className="w-full" {...field}>
                                            <SelectValue placeholder="Payment Received" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {Object.values(PaymentReceived).map((status, idx) => (
                                                    <SelectItem value={status} key={idx}>{status}</SelectItem>
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

                {/* Payment Received Date */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.paymentReceivedDate`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Received Date</FormLabel>
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
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={field.value as Date} onSelect={field.onChange} />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Payment Due Date */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.paymentDueDate`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Due Date</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={field.value as Date} onSelect={field.onChange} />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* TDS */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.tds`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>TDS</FormLabel>
                                <FormControl>
                                    <Input type='number' placeholder="Enter TDS" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Billing Remark */}
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycles.${index}.billingRemark`}
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

            </div>
        </div>
    );
};

export default BillingCycleForm;