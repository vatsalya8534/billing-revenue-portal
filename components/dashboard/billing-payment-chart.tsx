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

const billingData: Record<string, any[]> = {
  "2024": [
    { month: "Jan", billing: 12000, payment: 10000 },
    { month: "Feb", billing: 18000, payment: 15000 },
    { month: "Mar", billing: 9000, payment: 7000 },
    { month: "Apr", billing: 15000, payment: 13000 },
    { month: "May", billing: 17000, payment: 14000 },
    { month: "Jun", billing: 11000, payment: 9000 },
    { month: "Jul", billing: 14000, payment: 12000 },
    { month: "Aug", billing: 16000, payment: 15000 },
    { month: "Sep", billing: 9000, payment: 8000 },
    { month: "Oct", billing: 20000, payment: 18000 },
    { month: "Nov", billing: 21000, payment: 19000 },
    { month: "Dec", billing: 24000, payment: 22000 },
  ],
  "2025": [
    { month: "Jan", billing: 15000, payment: 12000 },
    { month: "Feb", billing: 12000, payment: 10000 },
    { month: "Mar", billing: 16000, payment: 14000 },
    { month: "Apr", billing: 18000, payment: 16000 },
    { month: "May", billing: 21000, payment: 19000 },
    { month: "Jun", billing: 19000, payment: 17000 },
    { month: "Jul", billing: 17000, payment: 15000 },
    { month: "Aug", billing: 22000, payment: 20000 },
    { month: "Sep", billing: 24000, payment: 22000 },
    { month: "Oct", billing: 26000, payment: 24000 },
    { month: "Nov", billing: 20000, payment: 18000 },
    { month: "Dec", billing: 30000, payment: 27000 },
  ],
}

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