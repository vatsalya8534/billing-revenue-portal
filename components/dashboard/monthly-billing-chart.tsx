"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const billingData: Record<string, any[]> = {
  "2024": [
    { month: "Jan", billing: 12000 },
    { month: "Feb", billing: 18000 },
    { month: "Mar", billing: 9000 },
    { month: "Apr", billing: 15000 },
    { month: "May", billing: 22000 },
    { month: "Jun", billing: 11000 },
    { month: "Jul", billing: 14000 },
    { month: "Aug", billing: 17000 },
    { month: "Sep", billing: 9000 },
    { month: "Oct", billing: 20000 },
    { month: "Nov", billing: 21000 },
    { month: "Dec", billing: 24000 },
  ],
  "2025": [
    { month: "Jan", billing: 15000 },
    { month: "Feb", billing: 12000 },
    { month: "Mar", billing: 16000 },
    { month: "Apr", billing: 18000 },
    { month: "May", billing: 21000 },
    { month: "Jun", billing: 19000 },
    { month: "Jul", billing: 17000 },
    { month: "Aug", billing: 22000 },
    { month: "Sep", billing: 24000 },
    { month: "Oct", billing: 26000 },
    { month: "Nov", billing: 20000 },
    { month: "Dec", billing: 30000 },
  ],
}

const chartConfig = {
  billing: {
    label: "Billing Amount",
    color: "hsl(var(--chart-1))",
  },
}

export function MonthlyBillingChart() {
  const [year, setYear] = useState("2025")

  const chartData = billingData[year]

  return (
    <div className="space-y-4">

      {/* Year Filter */}
      <div className="flex justify-end">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />

          <Bar
            dataKey="billing"
            radius={6}
            fill="#2563eb"
          />
        </BarChart>
      </ChartContainer>

    </div>
  )
}