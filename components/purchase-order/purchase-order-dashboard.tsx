"use client";

import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { MonthlyBillingChartCard } from "../dashboard/monthly-billing-chart";
import { getBillingStatusDetails } from "@/lib/actions/dashboard";
import { format } from "date-fns";

type Filters = {
  company: string;
  startDate?: Date;
  endDate?: Date;
  month: string;
  year: string;
};

const allMonths = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];
const now = new Date();
const currentFY = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
const years = Array.from(
  { length: currentFY - 2009 },
  (_, i) => currentFY - i,
);

function formatFinancialYearLabel(year: string) {
  if (!year || year === "all") return "All Financial Years";

  const numericYear = Number(year);
  if (Number.isNaN(numericYear)) return year;

  return `FY ${numericYear}-${String(numericYear + 1).slice(-2)}`;
}

function getActiveFilterSummary(filters: Filters) {
  const parts = [formatFinancialYearLabel(filters.year)];

  if (filters.month !== "all") {
    parts.push(`Month: ${allMonths[Number(filters.month)]}`);
  }

  if (filters.company !== "all") {
    parts.push("Filtered by Company");
  }

  return parts.join(" | ");
}

const PurchaseOrderDashboard = ({ companies, stats, plData }: any) => {
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    company: "all",
    startDate: undefined,
    endDate: undefined,
    month: "all",
    year: currentFY.toString(),
  });
  const [revenueDetails, setRevenueDetails] = useState<any[]>([]);

  const updateFilter = (key: string, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  const resetFilters = () =>
    setFilters({
      company: "all",
      startDate: undefined,
      endDate: undefined,
      month: "all",
      year: currentFY.toString(),
    });

  const fetchRevenueDetails = async () => {
    const data = await getBillingStatusDetails(Number(filters.year), filters);
    setRevenueDetails(data);
  };

  useEffect(() => {
    fetchRevenueDetails();
    setMounted(true);
  }, [JSON.stringify(filters)]);

  const filteredStats = revenueDetails.reduce(
    (acc, item) => {
      acc.totalBilledAmount += Number(item.amount || 0);
      acc.totalCollectedAmount += Number(item.collectedAmount || 0);
      acc.totalOverdueAmount += Number(item.overdueAmount || 0);
      return acc;
    },
    { totalBilledAmount: 0, totalCollectedAmount: 0, totalOverdueAmount: 0 },
  );

  const collectionEfficiency = filteredStats.totalBilledAmount
    ? Math.round(
        (filteredStats.totalCollectedAmount / filteredStats.totalBilledAmount) *
          100,
      )
    : 0;

  if (!mounted) return null;

  return (
    <>
      <div className="space-y-2 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-600">
          Dashboard Overview
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Revenue Dashboard
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-500">
          Track billed revenue, collections, overdue amounts, billing
          efficiency, and month-wise revenue movement with financial year
          filters.
        </p>
        <div className="inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          Currently showing: {getActiveFilterSummary(filters)}
        </div>
      </div>

      {/* FILTERS */}
      <div className="border rounded-2xl shadow-sm p-5 space-y-5 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Company */}
          <div className="space-y-2">
            <Label>Company</Label>
            <Select
              value={filters.company}
              onValueChange={(val) => updateFilter("company", val)}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl text-left font-normal"
                >
                  <CalendarIcon className="mr-2" />
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
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-xl text-left font-normal"
                >
                  <CalendarIcon className="mr-2" />
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

          {/* Month */}
          <div className="space-y-2">
            <Label>Month</Label>
            <Select
              value={filters.month}
              onValueChange={(val) => updateFilter("month", val)}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {allMonths.map((month, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label>Year</Label>
            <Select
              value={filters.year}
              onValueChange={(val) => updateFilter("year", val)}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {`FY ${y}-${String(y + 1).slice(-2)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <Button
              variant="destructive"
              className="w-full rounded-xl shadow-sm"
              onClick={resetFilters}
            >
              <X className="w-4 h-4 mr-1" /> Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Total Revenue</span>
              <span className="text-blue-500 font-bold">
                ₹{filteredStats.totalBilledAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Collected</span>
              <span className="text-blue-500 font-bold">
                ₹{filteredStats.totalCollectedAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Overdue</span>
              <span className="text-blue-500 font-bold">
                ₹{filteredStats.totalOverdueAmount.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Efficiency</span>
              <span className="text-blue-500 font-bold">
                {collectionEfficiency}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Bill Count</span>
              <span className="text-blue-500 font-bold">
                {revenueDetails.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* REVENUE TABLE */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Revenue Details</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>PO Amount</TableHead>
                <TableHead>Amount Received</TableHead>
                <TableHead>Amount Pending</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Billing Plan</TableHead>
                <TableHead>Contract Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revenueDetails.map((item, i) => {
                const pendingAmount = Math.max(
                  (item.amount || 0) - (item.collectedAmount || 0),
                  0,
                );
                return (
                  <TableRow key={i}>
                    <TableCell>{item.companyName || "-"}</TableCell>
                    <TableCell>{item.poNumber || "-"}</TableCell>
                    <TableCell>
                      ₹{Math.round(item.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ₹{Math.round(item.collectedAmount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      ₹{Math.round(pendingAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.serviceType || "-"}</TableCell>
                    <TableCell>{item.billingPlan || "-"}</TableCell>
                    <TableCell>{item.contractDuration || "-"}</TableCell>
                    <TableCell>{item.status || "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CHART */}
      <div className="grid grid-cols-1 gap-6 mt-4">
        <MonthlyBillingChartCard filters={filters} setFilters={setFilters} />
      </div>
    </>
  );
};

export default PurchaseOrderDashboard;
