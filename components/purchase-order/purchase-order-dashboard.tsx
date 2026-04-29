"use client";

import React, { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

import { getBillingStatusDetails } from "@/lib/actions/dashboard";
import { MonthlyBillingChartCard } from "../dashboard/monthly-billing-chart";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Filters = {
  company: string;
  startDate?: Date;
  endDate?: Date;
  month: string;
  year: string;
};

type CompanyOption = {
  id: string;
  name: string;
};

type RevenueDetail = {
  companyName?: string | null;
  poNumber?: string | null;
  amount?: number | string | null;
  collectedAmount?: number | string | null;
  overdueAmount?: number | string | null;
  serviceType?: string | null;
  billingPlan?: string | null;
  contractDuration?: string | null;
  status?: string | null;
};

type PurchaseOrderDashboardProps = {
  companies: CompanyOption[];
};

const financialYearMonths = [
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const toNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0);

const now = new Date();
const currentFY =
  now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
const years = Array.from({ length: currentFY - 2009 }, (_, i) => currentFY - i);

function formatFinancialYearLabel(year: string) {
  if (!year || year === "all") return "All Financial Years";

  const numericYear = Number(year);
  if (Number.isNaN(numericYear)) return year;

  return `FY ${numericYear}-${String(numericYear + 1).slice(-2)}`;
}

function getActiveFilterSummary(filters: Filters) {
  const parts = [formatFinancialYearLabel(filters.year)];

  if (filters.month !== "all") {
    parts.push(`Month: ${financialYearMonths[Number(filters.month)]}`);
  }

  if (filters.company !== "all") {
    parts.push("Filtered by Company");
  }

  return parts.join(" | ");
}

const PurchaseOrderDashboard = ({ companies }: PurchaseOrderDashboardProps) => {
  const [filters, setFilters] = useState<Filters>({
    company: "all",
    startDate: undefined,
    endDate: undefined,
    month: "all",
    year: currentFY.toString(),
  });
  const [revenueDetails, setRevenueDetails] = useState<RevenueDetail[]>([]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () =>
    setFilters({
      company: "all",
      startDate: undefined,
      endDate: undefined,
      month: "all",
      year: currentFY.toString(),
    });

  const fetchRevenueDetails = useCallback(async () => {
    const data = await getBillingStatusDetails(Number(filters.year), filters);
    setRevenueDetails(data);
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchRevenueDetails();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchRevenueDetails]);

  const filteredStats = revenueDetails.reduce(
    (acc, item) => {
      acc.totalBilledAmount += toNumber(item.amount);
      acc.totalCollectedAmount += toNumber(item.collectedAmount);
      acc.totalOverdueAmount += toNumber(item.overdueAmount);
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

      <div className="mb-4 space-y-5 rounded-2xl border p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <div className="min-w-0 space-y-2">
            <Label>Company</Label>
            <Select
              value={filters.company}
              onValueChange={(val) => updateFilter("company", val)}
            >
              <SelectTrigger className="w-full min-w-0 rounded-xl">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full min-w-0 justify-start overflow-hidden rounded-xl text-left font-normal"
                >
                  <CalendarIcon className="mr-2 shrink-0" />
                  {filters.startDate
                    ? format(filters.startDate, "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-xl p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => updateFilter("startDate", date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="min-w-0 space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full min-w-0 justify-start overflow-hidden rounded-xl text-left font-normal"
                >
                  <CalendarIcon className="mr-2 shrink-0" />
                  {filters.endDate
                    ? format(filters.endDate, "PPP")
                    : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto rounded-xl p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => updateFilter("endDate", date)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="min-w-0 space-y-2">
            <Label>Month</Label>
            <Select
              value={filters.month}
              onValueChange={(val) => updateFilter("month", val)}
            >
              <SelectTrigger className="w-full min-w-0 rounded-xl">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {financialYearMonths.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0 space-y-2">
            <Label>Year</Label>
            <Select
              value={filters.year}
              onValueChange={(val) => updateFilter("year", val)}
            >
              <SelectTrigger className="w-full min-w-0 rounded-xl">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {`FY ${year}-${String(year + 1).slice(-2)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="destructive"
              className="rounded-xl shadow-sm"
              onClick={resetFilters}
            >
              <X className="mr-1 h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Total Revenue</span>
              <span className="font-bold text-blue-500">
                {formatCurrency(filteredStats.totalBilledAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Collected</span>
              <span className="font-bold text-blue-500">
                {formatCurrency(filteredStats.totalCollectedAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Overdue</span>
              <span className="font-bold text-blue-500">
                {formatCurrency(filteredStats.totalOverdueAmount)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Efficiency</span>
              <span className="font-bold text-blue-500">
                {collectionEfficiency}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-bold">Bill Count</span>
              <span className="font-bold text-blue-500">
                {revenueDetails.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

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
              {revenueDetails.map((item, index) => {
                const pendingAmount = Math.max(
                  toNumber(item.amount) - toNumber(item.collectedAmount),
                  0,
                );

                return (
                  <TableRow key={index}>
                    <TableCell>{item.companyName || "-"}</TableCell>
                    <TableCell>{item.poNumber || "-"}</TableCell>
                    <TableCell>
                      {formatCurrency(Math.round(toNumber(item.amount)))}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(
                        Math.round(toNumber(item.collectedAmount)),
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(Math.round(pendingAmount))}
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

      <div className="mt-4 grid grid-cols-1 gap-6">
        <MonthlyBillingChartCard filters={filters} setFilters={setFilters} />
      </div>
    </>
  );
};

export default PurchaseOrderDashboard;
