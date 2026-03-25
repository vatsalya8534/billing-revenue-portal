"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getPLData } from "@/lib/actions/project";

// ================= TYPES =================
type ChartData = {
  month: string;
  revenue: number;
  cost: number;
};

type MonthlyPLChartProps = {
  plData?: any;
};

// ================= COMPONENT =================
export function MonthlyPLChart({ plData }: MonthlyPLChartProps) {

  const startYear = 2024;
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<string>(currentYear.toString());
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [summary, setSummary] = useState({
    revenue: 0,
    cost: 0,
    profit: 0,
  });

  const chartConfig = {
    revenue: { label: "Revenue", color: "#2563eb" },
    cost: { label: "Cost", color: "#f97316" },
  };

  useEffect(() => {
    async function loadData() {
      const allMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      const data = plData ?? (await getPLData(Number(year)));

      let totalRevenue = 0;
      let totalCost = 0;

      const safeData: ChartData[] = allMonths.map((month) => {
        const monthData = data.monthly?.find((m: any) => m.month === month);

        const revenue = Number(monthData?.revenue ?? 0);
        const cost = Number(monthData?.cost ?? 0);

        totalRevenue += revenue;
        totalCost += cost;

        return {
          month,
          revenue,
          cost,
        };
      });

      setChartData(safeData);

      setSummary({
        revenue: totalRevenue,
        cost: totalCost,
        profit: totalRevenue - totalCost,
      });
    }

    loadData();
  }, [year, plData]);

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 w-full min-w-0">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">

          {/* Year Select */}
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: currentYear - startYear + 1 },
                (_, i) => {
                  const y = (startYear + i).toString();
                  return (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  );
                }
              )}
            </SelectContent>
          </Select>

          {/* Summary */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-gray-500 font-semibold">Total Revenue</p>
              <p className="font-semibold text-blue-600">
                ₹{summary.revenue.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-gray-500 font-semibold">Total Cost</p>
              <p className="font-semibold text-orange-500">
                ₹{summary.cost.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-gray-500 font-semibold">Total Profit</p>
              <p className="font-semibold text-green-600">
                ₹{summary.profit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="flex flex-col lg:flex-row gap-4 w-full min-w-0">

          {/* Revenue Chart */}
          <Card className="flex-1 min-w-0">
            <CardHeader>
              <CardTitle>{chartConfig.revenue.label}</CardTitle>
            </CardHeader>

            <CardContent className="w-full h-[450px]">
              <ChartContainer
                className="h-full w-full"
                config={{ label: { color: "var(--foreground)" } } as ChartConfig}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
                    <YAxis type="category" dataKey="month" width={60} />
                    <ChartTooltip content={<ChartTooltipContent />} />

                    <Bar
                      dataKey="revenue"
                      fill={chartConfig.revenue.color}
                      barSize={24}
                    >
                      <LabelList
                        dataKey="revenue"
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

          {/* Cost Chart */}
          <Card className="flex-1 min-w-0">
            <CardHeader>
              <CardTitle>{chartConfig.cost.label}</CardTitle>
            </CardHeader>

            <CardContent className="w-full h-[450px]">
              <ChartContainer
                className="h-full w-full"
                config={{ label: { color: "var(--foreground)" } } as ChartConfig}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
                    <YAxis type="category" dataKey="month" width={60} />
                    <ChartTooltip content={<ChartTooltipContent />} />

                    <Bar
                      dataKey="cost"
                      fill={chartConfig.cost.color}
                      barSize={24}
                    >
                      <LabelList
                        dataKey="cost"
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

        </div>

      </CardContent>
    </Card>
  );
}