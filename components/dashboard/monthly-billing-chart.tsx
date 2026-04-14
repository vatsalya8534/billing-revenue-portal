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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { getMonthlyBillingData } from "@/lib/actions/dashboard";

// ================= TYPES =================
type ChartData = {
  month: string;
  value1: number;
  value2: number;
};

type Filters = {
  company: string;
  startDate?: Date;
  endDate?: Date;
  month: string;
  year: string;
};

type Props = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

// ================= HELPERS =================
function getFinancialYearRange(year: number) {
  return {
    startDate: new Date(year, 3, 1), // Apr 1
    endDate: new Date(year + 1, 2, 31), // Mar 31
  };
}

// ================= COMPONENT =================
export function MonthlyBillingChartCard({
  filters,
  setFilters,
}: Props) {
  const startYear = 2024;

  const now = new Date();
  const currentFY =
    now.getMonth() < 3
      ? now.getFullYear() - 1
      : now.getFullYear();

  const selectedYear = filters.year || currentFY.toString();

  const months = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const [chartData, setChartData] = useState<ChartData[]>([]);

  // ================= CONFIG =================
  const chartConfig = {
    billing: {
      label: "Billing Generated",
      color: "#f97316",
    },
    payment: {
      label: "Payment Received",
      color: "#10b981",
    },
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    async function loadData() {
      try {
        const yearNum = Number(selectedYear);

        // ✅ FY range
        const { startDate, endDate } =
          getFinancialYearRange(yearNum);

        // ✅ PASS FILTERS CORRECTLY
        const data = await getMonthlyBillingData(yearNum, {
          company: filters.company,
          month: filters.month,
          startDate,
          endDate,
        });

        // ✅ Normalize Apr → Mar
        const safeData: ChartData[] = months.map((month) => {
          const m = data.find((d: any) => d.month === month);

          return {
            month,
            value1: Number(m?.billing ?? 0),
            value2: Number(m?.payment ?? 0),
          };
        });

        setChartData(safeData);
      } catch (err) {
        console.error("Chart load error:", err);
        setChartData([]);
      }
    }

    loadData();
  }, [
    selectedYear,
    filters.company,
    filters.month,
  ]);

  // ================= CHART RENDER =================
  const renderBarChart = (
    dataKey: "value1" | "value2",
    label: string,
    color: string
  ) => (
    <Card className="flex-1 min-w-0" key={dataKey}>
      <CardHeader>
        <CardTitle className="text-center">{label}</CardTitle>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                type="number"
                domain={[0, "auto"]}
                tickFormatter={(val) => val.toLocaleString()}
              />

              <YAxis type="category" dataKey="month" />

              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />

              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[6, 6, 0, 0]}
                barSize={24}
              >
                <LabelList
                  dataKey={dataKey}
                  position="insideRight"
                  fontSize={13}
                  fill="#fff"
                  formatter={(val: number) =>
                    val === 0 ? "" : `₹${val.toLocaleString()}`
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  // ================= UI =================
  return (
    <>
      {/* Year Filter */}
      <div className="flex justify-end mb-4">
        <Select
          value={selectedYear}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, year: val }))
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>

          <SelectContent>
            {Array.from({ length: currentFY - startYear + 1 }, (_, i) => {
              const y = (startYear + i).toString();
              return (
                <SelectItem key={y} value={y}>
                  {`FY ${y}-${String(Number(y) + 1).slice(-2)}`}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {renderBarChart(
          "value1",
          chartConfig.billing.label,
          chartConfig.billing.color
        )}
        {renderBarChart(
          "value2",
          chartConfig.payment.label,
          chartConfig.payment.color
        )}
      </div>
    </>
  );
}