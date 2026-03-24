"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { MonthlyBillingChartCard } from "./monthly-billing-chart";
import { BillingStatusChart } from "./billing-status-chart";
import PLBillingCycle from "@/components/pl/pl-billing-cycle";
import { useForm, useFieldArray } from "react-hook-form";

interface DashboardTabsProps {
  stats: {
    billCount: number;
    currentMonth: string;
    billingThisMonth: number;
    totalBilledAmount: number;
  };
  plData: any; // P/L data including billingCycle array
}

export function DashboardTabs({ stats, plData }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<"revenue" | "profit-loss">("revenue");

  // React Hook Form for Profit & Loss tab
  const form = useForm({
    defaultValues: plData || { billingCycle: [] },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "billingCycle",
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "revenue" | "profit-loss")}
      >
        <TabsList variant="line">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="grid gap-6">
            {/* Top Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <p className="text-sm font-medium text-gray-500">Bill Count</p>
                <h2 className="text-2xl font-bold">{stats.billCount || 0}</h2>
              </div>

              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Billing This Month ({stats.currentMonth})
                </p>
                <h2 className="text-2xl font-bold">₹{stats.billingThisMonth || 0}</h2>
              </div>

              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <p className="text-sm font-medium text-gray-500">Total Billed Amount</p>
                <h2 className="text-2xl font-bold">₹{stats.totalBilledAmount || 0}</h2>
              </div>
            </div>

            {/* Monthly Billing Chart */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Monthly Billing Trend</h3>
              <MonthlyBillingChartCard />
            </div>

            {/* Billing Status Chart */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Billing Status</h3>
              <BillingStatusChart />
            </div>
          </div>
        </TabsContent>

        {/* Profit & Loss Tab */}
        <TabsContent value="profit-loss">
          <Accordion type="single" collapsible defaultValue="billing-cycle-0">
            {fields.length === 0 && (
              <p className="text-gray-500 p-4">No Data Found.</p>
            )}
            {fields.map((field, index) => (
              <PLBillingCycle
                key={index}
                field={field}
                index={index}
                form={form}
              />
            ))}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}