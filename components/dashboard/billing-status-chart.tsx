"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts"
import { getBillingStatusData } from "@/lib/actions/dashboard"

export function BillingStatusChart() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear.toString())
  const [chartData, setChartData] = useState<any[]>([])

  const colors: Record<string, string> = {
    "Bill Generated": "#3b82f6",
    "Payment Received": "#10b981", 
    "Overdue": "#ef4444",
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBillingStatusData(Number(year))

        const allStatuses = ["Bill Generated", "Payment Received", "Overdue"]
        const completeData = allStatuses.map(status => {
          const existing = data.find(d => d.status === status)
          return {
            status,
            value: existing ? existing.value : 0,
          }
        })

        const MIN_SLICE = 5 // slightly larger than before
        const normalizedData = completeData.map(d => ({
          ...d,
          value: d.value === 0 ? MIN_SLICE : d.value,
          fill: colors[d.status],
        }))

        setChartData(normalizedData)
      } catch (err) {
        console.error("Failed to fetch billing status data:", err)
      }
    }

    fetchData()
  }, [year])

  return (
    <div className="space-y-4">
      {/* Year Selector */}
      <div className="flex justify-end">
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value={currentYear - 2}>{currentYear - 2}</option>
          <option value={currentYear - 1}>{currentYear - 1}</option>
          <option value={currentYear}>{currentYear}</option>
        </select>
      </div>

      {/* Pie Chart */}
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip formatter={(value: number, name: string) => [`₹${value}`, name]} />
            <Legend />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="status"
              innerRadius={60}
              outerRadius={100}
              cornerRadius={5} // makes slices slightly rounded
            
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}