"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { filterProjectData, getBillingDetailsByMonth, getCostDetailsByMonth } from "@/lib/actions/project";
import { TotalBilledChart } from "./total-billed-revenue-month";
import { TotalCostChart } from "./total-cost-revenue-month";

export function PLDashboardComponent({ companies, projects }: any) {
    const [mounted, setMounted] = useState(false)
    const [filteredValues, setFilteredValues] = useState<any>([])
    const [totalValues, setTotalValues] = useState<any>({
        totalPOValue: 0,
        totalBilledValue: 0,
        totalCostValue: 0,
        totalFMSValue: 0,
        totalSpareValue: 0,
        totalResourceCount: 0,
        totalProfit: 0,
    })

    const [filters, setFilters] = useState({
        company: "all",
        project: "all",
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
    });

    const [selectedMonth, setSelectedMonth] = useState<{
        month: number;
        year: number;
    } | null>(null);

    const [billingDetails, setBillingDetails] = useState<any[]>([]);
    const [costDetails, setCostDetails] = useState<any[]>([]);
    const [activeTable, setActiveTable] = useState<"billing" | "cost" | null>(null);


    const updateFilter = (key: string, value: any) => {
        const updated = { ...filters, [key]: value };
        setFilters(updated);
    };

    const resetFilters = () => {
        const reset = {
            company: "all",
            project: "all",
            startDate: undefined,
            endDate: undefined,
        };
        setFilters(reset)
    };

    const filterData = async () => {
        let res = await filterProjectData(filters)

        setFilteredValues(res.data)
        setTotalValues({
            totalPOValue: res.totalPOValue,
            totalBilledValue: res.totalBilledValue,
            totalCostValue: res.totalCostValue,
            totalFMSValue: res.totalFMSValue,
            totalSpareValue: res.totalSpareValue,
            totalResourceCount: res.totalResourceCount,
            totalProfit: res.totalProfit,
        })
    }

    useEffect(() => {
        filterData()
        setMounted(true);
    }, [JSON.stringify(filters)])

    useEffect(() => {
        if (!selectedMonth) return;

        const { month, year } = selectedMonth;

        async function loadDetails() {
            const billing = await getBillingDetailsByMonth({
                month,
                year,
            });

            const cost = await getCostDetailsByMonth({
                month,
                year,
            });

            setBillingDetails(billing);
            setCostDetails(cost);
        }

        loadDetails();
    }, [selectedMonth]);


    if (mounted) {
        return (
            <div className="space-y-4">
                <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-5">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Filters</h2>
                    </div>

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                        {/* Company */}
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Company</Label>
                            <Select
                                value={filters.company}
                                onValueChange={(value) => updateFilter("company", value)}
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Companies</SelectItem>
                                    {companies?.map((company: any) => (
                                        <SelectItem value={company.id} key={company.id}>
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Project */}
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Project</Label>
                            <Select
                                value={filters.project}
                                onValueChange={(value) => updateFilter("project", value)}
                            >
                                <SelectTrigger className="w-full rounded-xl">
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects?.map((project: any) => (
                                        <SelectItem value={project.id} key={project.id}>
                                            {project.projectName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* From Date */}
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">From Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start rounded-xl text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {filters.startDate
                                            ? format(filters.startDate, "PPP")
                                            : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl">
                                    <Calendar
                                        mode="single"
                                        selected={filters.startDate}
                                        onSelect={(date) => updateFilter("startDate", date)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* To Date */}
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">To Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start rounded-xl text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {filters.endDate
                                            ? format(filters.endDate, "PPP")
                                            : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl">
                                    <Calendar
                                        mode="single"
                                        selected={filters.endDate}
                                        onSelect={(date) => updateFilter("endDate", date)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Reset Button (desktop inline) */}
                        <div className="flex items-end">
                            <Button
                                variant="destructive"
                                className="w-full rounded-xl shadow-sm"
                                onClick={resetFilters}
                            >
                                <X className="w-4 h-4 mr-1" />
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-6 gap-4">
                    <Card>
                        <CardContent>
                            <div className="flex justify-between">
                                <span>Total PO Value</span>
                                <span>{totalValues.totalPOValue}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <div className="flex justify-between">
                                <span>Total Billed Value</span>
                                <span>{totalValues.totalBilledValue}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <div className="flex justify-between">
                                <span>Total Cost Value</span>
                                <span>{totalValues.totalCostValue}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex justify-between">
                                <span>Total Resouces Count</span>
                                <span>{totalValues.totalResourceCount}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex justify-between">
                                <span>Total FMS Value</span>
                                <span>{totalValues.totalFMSValue}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex justify-between">
                                <span>Total Spare Value</span>
                                <span>{totalValues.totalSpareValue}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex justify-between">
                                <span>Total GM %</span>
                                <span>{totalValues.totalProfit}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-4">
                    <CardHeader>
                        <h2>Profit and Lost</h2>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        Company Name
                                    </TableHead>
                                    <TableHead>
                                        Project Name
                                    </TableHead>
                                    <TableHead>
                                        PO Value
                                    </TableHead>
                                    <TableHead>
                                        Total Billed Revenue upto last update
                                    </TableHead>
                                    <TableHead>
                                        Total Cost  upto last update
                                    </TableHead>
                                    <TableHead>
                                        Current GM%
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    filteredValues.length > 0 && filteredValues.map((project: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                {project.company.name}
                                            </TableCell>
                                            <TableCell>
                                                {project.projectName}
                                            </TableCell>
                                            <TableCell>
                                                {project.poValue}
                                            </TableCell>
                                            <TableCell>
                                                {project.totalRevenue}
                                            </TableCell>
                                            <TableCell>
                                                {project.totalCost}
                                            </TableCell>
                                            <TableCell>
                                                {(((project.totalRevenue - project.totalCost) / project.totalRevenue) * 100).toFixed(2)} %
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }

                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <TotalBilledChart
                        onMonthClick={(data) => {
                            setSelectedMonth(data);
                            setActiveTable("billing");
                        }}
                    />
                    <TotalCostChart
                        onMonthClick={(data) => {
                            setSelectedMonth(data);
                            setActiveTable("cost");
                        }}
                    />
                </div>

                {activeTable === "billing" && (
                    <Card className="mt-4">
                        <CardHeader>
                            <h2>Billing Amount In Detail</h2>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Company Name</TableHead>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>Billing Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {billingDetails.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.month}</TableCell>
                                            <TableCell>{item.year}</TableCell>
                                            <TableCell>{item.companyName}</TableCell>
                                            <TableCell>{item.projectName}</TableCell>
                                            <TableCell>{item.billed}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {activeTable === "cost" && (
                    <Card className="mt-4">
                        <CardHeader>
                            <h2>Total Cost In Detail</h2>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead>Year</TableHead>
                                        <TableHead>Company Name</TableHead>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>FMS</TableHead>
                                        <TableHead>Spare</TableHead>
                                        <TableHead>Other</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {costDetails.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{item.month}</TableCell>
                                            <TableCell>{item.year}</TableCell>
                                            <TableCell>{item.companyName}</TableCell>
                                            <TableCell>{item.projectName}</TableCell>
                                            <TableCell>{item.fms}</TableCell>
                                            <TableCell>{item.spare}</TableCell>
                                            <TableCell>{JSON.stringify(item.other)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }
}