"use client"

import { useState } from "react"
import { Line, LineChart, CartesianGrid, XAxis } from "recharts"

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

const chartConfig = {
  billing: {
    label: "Billing",
    color: "#3b82f6",
  },
  payment: {
    label: "Payment",
    color: "#10b981",
  },
}

export function BillingPaymentChart() {
  const [year, setYear] = useState("2025")

  const chartData : any[]= []

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
        <LineChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />

          <ChartTooltip content={<ChartTooltipContent />} />

          <Line
            type="monotone"
            dataKey="billing"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="payment"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
          />

        </LineChart>
      </ChartContainer>

    </div>
  )
}