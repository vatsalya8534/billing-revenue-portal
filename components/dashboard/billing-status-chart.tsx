"use client";

import { useEffect, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { getBillingStatusData, getBillingStatusDetails } from "@/lib/actions/dashboard";

interface BillingDetail {
  status: string;
  value: number;
  fill?: string;
}

interface POItem {
  id: string;
  poNumber: string;
  customerName: string;
  serviceName?: string;
  billingPlan?: string;
  amount: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  extraAmount?: number;
}

export function BillingStatusChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());
  const [chartData, setChartData] = useState<BillingDetail[]>([]);
  const [selectedSlice, setSelectedSlice] = useState<BillingDetail | null>(null);
  const [sliceDetails, setSliceDetails] = useState<POItem[]>([]);

  const colors: Record<string, string> = {
    "Bill Generated": "#3b82f6",
    "Payment Received": "#10b981",
    "Overdue": "#ef4444",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBillingStatusData(Number(year));

        const allStatuses = ["Bill Generated", "Payment Received", "Overdue"];

        const completeData = allStatuses.map((status) => {
          const existing = data.find((d) => d.status === status);
          return {
            status,
            value: existing ? existing.value : 0,
            fill: colors[status],
          };
        });

        const MIN_SLICE = 5;
        const normalizedData = completeData.map((d) => ({
          ...d,
          value: d.value === 0 ? MIN_SLICE : d.value,
        }));

        setChartData(normalizedData);
        setSelectedSlice(null);
        setSliceDetails([]);
      } catch (err) {
        console.error("Failed to fetch billing status data:", err);
      }
    };

    fetchData();
  }, [year]);

  const handleSliceClick = async (data: BillingDetail) => {
    setSelectedSlice(data);
    try {
      const details: POItem[] = await getBillingStatusDetails(data.status, Number(year));
      setSliceDetails(details);
    } catch (err) {
      console.error("Failed to fetch slice details:", err);
      setSliceDetails([]);
    }
  };

  const extraColumnHeader =
    selectedSlice?.status === "Overdue"
      ? "Overdue"
      : selectedSlice?.status === "Payment Received"
      ? "Received"
      : "Extra";

  return (
    <div className="flex flex-col md:flex-row gap-4">
      
      {/* LEFT: Smaller Pie Chart */}
      <div className="w-full md:w-1/3 flex flex-col items-start">
        
        <div className="w-full flex justify-start mb-2">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value={currentYear - 2}>{currentYear - 2}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
          </select>
        </div>

        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(value: number, name: string) => [`₹${value}`, name]} />
              <Legend />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="status"
                innerRadius={50}
                outerRadius={80}   // 🔽 smaller pie
                cornerRadius={5}
                onClick={handleSliceClick}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RIGHT: Bigger Table */}
      <div className="w-full md:w-2/3 overflow-auto max-h-[360px]">
        {selectedSlice ? (
          <div className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Details: {selectedSlice.status}</h3>

            {sliceDetails.length ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">PO Number</th>
                    <th className="border px-2 py-1">Customer</th>
                    <th className="border px-2 py-1">Service</th>
                    <th className="border px-2 py-1">Billing Plan</th>
                    <th className="border px-2 py-1">Amount</th>
                    <th className="border px-2 py-1">Start</th>
                    <th className="border px-2 py-1">End</th>
                    <th className="border px-2 py-1">{extraColumnHeader}</th>
                  </tr>
                </thead>

                <tbody>
                  {sliceDetails.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 py-1">{item.poNumber}</td>
                      <td className="border px-2 py-1">{item.customerName}</td>
                      <td className="border px-2 py-1">{item.serviceName || "-"}</td>
                      <td className="border px-2 py-1">{item.billingPlan || "-"}</td>
                      <td className="border px-2 py-1">₹{item.amount}</td>
                      <td className="border px-2 py-1">{item.startDate || "-"}</td>
                      <td className="border px-2 py-1">{item.endDate || "-"}</td>
                      <td className="border px-2 py-1">₹{item.extraAmount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No records found for this status.</p>
            )}
          </div>
        ) : (
          <div className="border p-4 rounded shadow text-gray-500">
            Click on the chart to see details
          </div>
        )}
      </div>
    </div>
  );
}