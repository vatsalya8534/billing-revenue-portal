"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getMonthlyBillingData } from "@/lib/actions/dashboard";

type ChartData = {
  month: string;
  billing: number;
  payment: number;
};

const chartConfigBilling = {
  label: { color: "var(--foreground)" },
  billing: { label: "Billing Generated", color: "#2563eb" },
} satisfies ChartConfig;

const chartConfigPayment = {
  label: { color: "var(--foreground)" },
  payment: { label: "Payment Received", color: "#f97316" },
} satisfies ChartConfig;

export function MonthlyBillingChartCard() {
  const startYear = 2024;
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<string>(currentYear.toString());
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await getMonthlyBillingData(Number(year));

      const allMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      const safeData: ChartData[] = allMonths.map((month) => {
        const monthData = data.find((d: any) => d.month === month);
        return {
          month,
          billing: monthData ? Number(monthData.billing) : 0,
          payment: monthData ? Number(monthData.payment) : 0,
        };
      });

      setChartData(safeData);
    }

    loadData();
  }, [year]);

  return (
    <Card>
      <CardContent className="space-y-4">

        {/* Year Selector */}
        <div className="flex justify-end mb-4">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: currentYear - startYear + 1 }, (_, i) => {
                const y = (startYear + i).toString();
                return <SelectItem key={y} value={y}>{y}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Charts side by side */}
        <div className="flex gap-4">

          {/* Billing Chart */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Billing Generated</CardTitle>
            </CardHeader>
            <CardContent className="h-[450px]"> {/* Increased height */}
              <ChartContainer config={chartConfigBilling} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    barCategoryGap="10%" // reduce gap to make bars fill more space
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} />
                    <XAxis type="number" tickFormatter={(val: number) => val.toLocaleString()} />
                    <YAxis type="category" dataKey="month" />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="billing" fill={chartConfigBilling.billing.color} radius={[6, 6, 0, 0]} barSize={30}> {/* thicker bars */}
                      <LabelList
                        dataKey="billing"
                        position="right"
                        fontSize={12}
                        fill="#000"
                        formatter={(val: number) => (val === 0 ? "" : val.toLocaleString())}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Payment Chart */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Payment Received</CardTitle>
            </CardHeader>
            <CardContent className="h-[450px]"> {/* Increased height */}
              <ChartContainer config={chartConfigPayment} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    barCategoryGap="10%" // reduce gap
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} />
                    <XAxis type="number" tickFormatter={(val: number) => val.toLocaleString()} />
                    <YAxis type="category" dataKey="month" />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="payment" fill={chartConfigPayment.payment.color} radius={[6, 6, 0, 0]} barSize={30}>
                      <LabelList
                        dataKey="payment"
                        position="right"
                        fontSize={12}
                        fill="#000"
                        formatter={(val: number) => (val === 0 ? "" : val.toLocaleString())}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

        </div>
      </CardContent>
    </Card>
  );
}