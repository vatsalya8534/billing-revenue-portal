"use client"

import { useState } from "react"
import { Pie, PieChart } from "recharts"

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

const billingStatusData: Record<string, any[]> = {
  "2024": [
    { status: "Paid", value: 45, fill: "#3b82f6" },
    { status: "Pending", value: 30, fill: "#f59e0b" },
    { status: "Overdue", value: 15, fill: "#ef4444" },
  ],
  "2025": [
    { status: "Paid", value: 60, fill: "#3b82f6" },
    { status: "Pending", value: 25, fill: "#f59e0b" },
    { status: "Overdue", value: 10, fill: "#ef4444" },
  ],
}

const chartConfig = {
  value: {
    label: "Bills",
  },
}

export function BillingStatusChart() {
  const [year, setYear] = useState("2025")

  const chartData = billingStatusData[year]

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
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="status"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
          />
        </PieChart>
      </ChartContainer>

    </div>
  )
}