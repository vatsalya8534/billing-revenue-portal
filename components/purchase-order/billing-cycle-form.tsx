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

const BillingCycleForm = ({ index, control }: { index: number, control: any }) => {

    return (
        <div className='border p-4'>
            <h1 className='font-bold mb-4 border-b'>{index + 1 } Billing Cycle</h1>
            <div className="grid grid-cols-2 gap-4 ">
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycle.${index}.billingNumber`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter Billing Number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className='space-y-2'>
                    <FormField
                        control={control}
                        name={`billingCycle.${index}.billingAmount`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Amount</FormLabel>
                                <FormControl>
                                    <Input type='number' placeholder="Enter Billing Amount" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div className='space-y-2'>

                    <FormField
                        control={control}
                        name={`billingCycle.${index}.billingDate`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Date</FormLabel>
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
                </div>
                <div className='space-y-2'>

                    <FormField
                        control={control}
                        name={`billingCycle.${index}.billingSubmittedDate`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billing Submitted Date</FormLabel>
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
                </div>
                <div className='space-y-2'>

                    <FormField
                        control={control}
                        name={`billingCycle.${index}.paymentReceived`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Received</FormLabel>
                                <FormControl>
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={(v) => field.onChange(v)}
                                    >
                                        <SelectTrigger className="w-full" {...field}>
                                            <SelectValue placeholder="Payment Received" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {
                                                    Object.values(PaymentReceived).map((status, index) => (
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
                <div className='space-y-2'>

                    <FormField
                        control={control}
                        name={`billingCycle.${index}.paymentReceivedDate`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Received Date</FormLabel>
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
                </div>
                <div className='space-y-2'>

                    <FormField
                        control={control}
                        name={`billingCycle.${index}.paymentReceivedAmount`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Payment Received Amount</FormLabel>
                                <FormControl>
                                    <Input type='number' placeholder="Enter Payment Received Amount" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='space-y-2'>

                    <FormField
                        control={control}
                        name={`billingCycle.${index}.billingRemark`}
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

    )
}

export default BillingCycleForm