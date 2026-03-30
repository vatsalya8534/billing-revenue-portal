"use client";

import { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const description = "Horizontal bar chart with year filter";

const rawData = [
  { year: 2024, month: 1, value: 186 },
  { year: 2024, month: 2, value: 305 },
  { year: 2024, month: 3, value: 237 },
  { year: 2024, month: 4, value: 73 },
  { year: 2024, month: 5, value: 209 },
  { year: 2024, month: 6, value: 214 },

  { year: 2025, month: 1, value: 150 },
  { year: 2025, month: 2, value: 280 },
  { year: 2025, month: 3, value: 200 },
  { year: 2025, month: 4, value: 90 },
  { year: 2025, month: 5, value: 250 },
  { year: 2025, month: 6, value: 300 },
];

const chartConfig = {
  value: {
    label: "Billing",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// 📅 Month labels
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function TotalCostChart() {
  const [year, setYear] = useState("2025");

  // 🎯 Filter + fill missing months
  const chartData = useMemo(() => {
    const filtered = rawData.filter(
      (d) => d.year.toString() === year
    );

    // ensure Jan–Dec always present
    return months.map((m, index) => {
      const found = filtered.find((d) => d.month === index + 1);

      return {
        month: m,
        value: found?.value || 0,
      };
    });
  }, [year]);

  const years = [...new Set(rawData.map((d) => d.year))];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Billing</CardTitle>
          <CardDescription>Jan - Dec</CardDescription>
        </div>

        {/* 🎛️ Year Filter */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px] rounded-xl">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 10 }}
          >
            {/* Value Axis */}
            <XAxis type="number" hide />

            {/* Month Axis */}
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />

            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={5}
              onClick={(data) => console.log(data)}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}