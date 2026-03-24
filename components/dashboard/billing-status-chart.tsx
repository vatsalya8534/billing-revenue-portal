"use client";

import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import {
  getBillingStatusData,
  getBillingStatusDetails,
} from "@/lib/actions/dashboard";

// ================= TYPES =================
interface BillingDetail {
  status: string;
  value: number;
  fill?: string;
}

interface POItem {
  id: string;
  poNumber: string;
  invoiceNumber?: string;
  companyName?: string;
  serviceName?: string;
  billingPlan?: string;
  amount: number;
  startDate?: string;
  endDate?: string;
  extraAmount?: number;
}

// ================= COMPONENT =================
export function BillingStatusChart() {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [chartData, setChartData] = useState<BillingDetail[]>([]);
  const [selectedSlice, setSelectedSlice] =
    useState<BillingDetail | null>(null);
  const [sliceDetails, setSliceDetails] = useState<POItem[]>([]);

  const colors: Record<string, string> = {
    "Bill Generated": "#3b82f6",
    "Payment Received": "#10b981",
    Overdue: "#ef4444",
  };

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      const data = await getBillingStatusData(Number(year), month);

      const statuses = ["Bill Generated", "Payment Received", "Overdue"];

      const finalData = statuses.map((status) => {
        const found = data.find((d) => d.status === status);
        return {
          status,
          value: found?.value || 0,
          fill: colors[status],
        };
      });

      setChartData(finalData);
      setSelectedSlice(null);
      setSliceDetails([]);
    };

    fetchData();
  }, [year, month]);

  // ================= HANDLE CLICK =================
  const handleSliceClick = async (data: BillingDetail) => {
    if (data.value === 0) return; // ✅ prevent useless clicks

    setSelectedSlice(data);

    const details = await getBillingStatusDetails(
      data.status,
      Number(year),
      month
    );

    setSliceDetails(details || []);
  };

  // ================= TOTAL =================
  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

  // ================= COLUMN HEADER =================
  const extraColumnHeader =
    selectedSlice?.status === "Overdue"
      ? "Overdue"
      : selectedSlice?.status === "Payment Received"
      ? "Received"
      : "Extra";

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* LEFT SIDE */}
      <div className="w-full md:w-1/3">
        <div className="flex gap-2 mb-2">
          {/* YEAR */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value={currentYear - 2}>{currentYear - 2}</option>
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
          </select>

          {/* MONTH */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {[
              "Jan","Feb","Mar","Apr","May","Jun",
              "Jul","Aug","Sep","Oct","Nov","Dec"
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* PIE OR NO DATA */}
        {totalValue > 0 ? (
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip formatter={(v: number) => [`₹${v}`]} />
                <Legend />

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={50}
                  outerRadius={80}
                  onClick={handleSliceClick}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[260px] flex items-center justify-center border rounded text-gray-500">
            No data found
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-2/3 overflow-auto max-h-[360px]">
        {totalValue === 0 ? (
          <div className="border p-4 text-gray-500">
            No data found
          </div>
        ) : selectedSlice ? (
          <div className="border p-4 rounded shadow">
            <h3 className="font-semibold mb-2">
              {selectedSlice.status}
            </h3>

            <table className="w-full text-sm border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">PO Number</th>
                  <th className="border px-2 py-1">Invoice Number</th>
                  <th className="border px-2 py-1">Company Name</th>
                  <th className="border px-2 py-1">Service Type</th>
                  <th className="border px-2 py-1">Billing Plan</th>
                  <th className="border px-2 py-1">Amount</th>
                  <th className="border px-2 py-1">{extraColumnHeader}</th>
                </tr>
              </thead>

              <tbody>
                {sliceDetails.length > 0 ? (
                  sliceDetails.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2">{item.poNumber}</td>
                      <td className="border px-2">{item.invoiceNumber}</td>
                      <td className="border px-2">
                        {item.companyName || "-"}
                      </td>
                      <td className="border px-2">{item.serviceName}</td>
                      <td className="border px-2">{item.billingPlan}</td>
                      <td className="border px-2">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="border px-2">
                        ₹{(item.extraAmount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-3 text-gray-500"
                    >
                      No details found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border p-4 text-gray-500">
            Click chart to view details
          </div>
        )}
      </div>
    </div>
  );
}