"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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

import { getMonthlyRevenueCost } from "@/lib/actions/project";
import { any } from "zod";

type Props = {
  onMonthClick?: (data: { month: number; year: number }) => void;
};

const chartConfig = {
  value: {
    label: "Cost",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TotalCostChart({ onMonthClick }: Props) {
  const currentYear = new Date().getFullYear().toString();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<{ month: string; value: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getMonthlyRevenueCost(Number(year));
        setData(
          res.cost.map((d, i) => ({
            ...d,
            monthNumber: i + 1,
            year: Number(year),
          }))
        );
      } catch (err) {
        console.error("Failed to load cost data:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [year]);

  const currentYears = new Date().getFullYear();

  const years = Array.from({ length: 3 }, (_, i) =>
    (currentYears - i).toString()
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Cost</CardTitle>
          <CardDescription>Jan - Dec</CardDescription>
        </div>

        {/* Year Filter */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px] rounded-xl">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 10 }}
            height={400}
          >
            {/* X Axis (values) */}
            <XAxis type="number" hide />

            {/* Y Axis (months) */}
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />

            {/* Tooltip */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />

            {/* Bars */}
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={5}
              onClick={(entry: any) => {
                onMonthClick?.({
                  month: entry.payload.monthNumber,
                  year: entry.payload.year,
                });
              }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}