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
import { getPLData } from "@/lib/actions/project";

type ChartData = {
  month: string;
  value1: number;
  value2: number;
};
type MonthlyBillingChartCardProps = {
  plData?: any;

};


export function MonthlyBillingChartCard({ plData }: MonthlyBillingChartCardProps) {
  const startYear = 2024;
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<string>(currentYear.toString());
  const [mode, setMode] = useState<"revenue" | "profit-loss">("revenue");
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const chartConfig = {
    revenue: { label: "Billing Generated", color1: "#2563eb", label2: "Payment Received", color2: "#f97316" },
    "profit-loss": { label: "Revenue", color1: "#2563eb", label2: "Cost", color2: "#f97316" },
  };

  useEffect(() => {
    async function loadData() {
      const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      let safeData: ChartData[] = [];

      if (mode === "revenue") {
        const data = await getMonthlyBillingData(Number(year));

        safeData = allMonths.map((month) => {
          const monthData = data.find((d: any) => d.month === month);
          return {
            month,
            value1: Number(monthData?.billing ?? 0),
            value2: Number(monthData?.payment ?? 0),
          };
        });

      } else {
        const data = plData ?? await getPLData(Number(year));

        safeData = allMonths.map((month) => {
          const monthData = data.monthly?.find((m: any) => m.month === month);

          return {
            month,
            value1: Number(monthData?.revenue ?? 0),
            value2: Number(monthData?.cost ?? 0),
          };
        });
      }

      setChartData(safeData);
    }

    loadData();
  }, [year, mode, plData]);

  return (
    <>
      {/* Year & Mode Selector */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
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
      </div>

      {/* Charts side by side */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">

        {/* Value 1 Chart */}
        <Card className="flex-1 min-w-0">
          <CardHeader>
            <CardTitle className="text-center">{chartConfig[mode].label}</CardTitle>
          </CardHeader>
          <CardContent className="w-full h-[420px]">
            <ChartContainer
              className="h-full w-full"
              config={{ label: { color: "var(--foreground)" } } as ChartConfig}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  barCategoryGap="10%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} />
                  <XAxis type="number" tickFormatter={(val) => val.toLocaleString()} />
                  <YAxis type="category" dataKey="month" />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

                  <Bar
                    dataKey="value1"
                    fill={chartConfig[mode].color1}
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  >
                    <LabelList
                      dataKey="value1"
                      position="insideRight"
                      fontSize={15}
                      fill="#fff"
                      formatter={(val: number) =>
                        val === 0 ? "" : " ₹" + val.toFixed(2)
                      }
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Value 2 Chart */}
        <Card className="flex-1 min-w-0">
          <CardHeader>
            <CardTitle className="text-center">{chartConfig[mode].label2}</CardTitle>
          </CardHeader>
          <CardContent className="w-full h-[420px]">
            <ChartContainer
              className="h-full w-full"
              config={{ label: { color: "var(--foreground)" } } as ChartConfig}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                  barCategoryGap="10%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} />
                  <XAxis type="number" tickFormatter={(val) => val.toLocaleString()} />
                  <YAxis type="category" dataKey="month" />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

                  <Bar
                    dataKey="value2"
                    fill={chartConfig[mode].color2}
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  >
                    <LabelList
                      dataKey="value2"
                      position="insideRight"
                      fontSize={15}
                      fill="#fff"
                      formatter={(val: number) =>
                        val ===0 ? "" : " ₹" + val.toFixed(2)
                      }
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>
    </>
  );
}