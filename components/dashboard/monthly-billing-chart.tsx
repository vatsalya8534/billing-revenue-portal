"use client"

import { useEffect, useState } from "react"
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

import { getMonthlyBillingData } from "@/lib/actions/dashboard"

const chartConfig = {
  billing: {
    label: "Billing Generated",
    color: "#2563eb",
  },
  payment: {
    label: "Payment Received",
    color: "#f97316",
  },
}

export function MonthlyBillingChart() {
  const startYear = 2024
  const currentYear = new Date().getFullYear()

  const [year, setYear] = useState(currentYear.toString())
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const data = await getMonthlyBillingData(Number(year))
      setChartData(data)
    }
    loadData()
  }, [year])

  return (
    <div className="space-y-4">
      {/* Year Filter */}
      <div className="flex justify-end">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>

          <SelectContent>
            {Array.from(
              { length: currentYear - startYear + 1 },
              (_, i) => {
                const y = (startYear + i).toString()
                return (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                )
              }
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[320px] w-full">
        <BarChart data={chartData} barGap={6}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />

          <ChartTooltip
            content={<ChartTooltipContent indicator="dot" />}
          />

          <Bar
            dataKey="billing"
            name="Billing Generated"
            fill="#2563eb"
            radius={6}
            minPointSize={3}
          />

          <Bar
            dataKey="payment"
            name="Payment Received"
            fill="#f97316"
            radius={6}
            minPointSize={3}
          />
        </BarChart>
      </ChartContainer>

      <div className="flex gap-6 mt-2 justify-start items-center">
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: chartConfig.billing.color }}
          />
          <span className="text-sm font-medium">Billing Generated</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: chartConfig.payment.color }}
          />
          <span className="text-sm font-medium">Payment Received</span>
        </div>
      </div>
    </div>
  )
}