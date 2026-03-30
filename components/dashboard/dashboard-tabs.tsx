"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";

import { MonthlyBillingChartCard } from "./monthly-billing-chart";
import { MonthlyPLChart } from "./monthly-pl-chart";
import { BillingStatusChart } from "./billing-status-chart";
import { PLStatusChart } from "./pl-status-chart";

import PLBillingCycle from "@/components/pl/pl-billing-cycle";

import { useForm, useFieldArray } from "react-hook-form";
import { Form } from "@/components/ui/form";

// ================= TYPES =================
interface BillingCycleField {
  id: string;
  billedAmount: number;
  otherCost: number;
}

interface PLFormValues {
  billingCycle: BillingCycleField[];
}

interface DashboardStats {
  billCount: number;
  currentMonth: string;
  billingThisMonth: number;
  totalBilledAmount: number;
}

interface DashboardTabsProps {
  stats: DashboardStats;
  plData?: PLFormValues;
}

// ================= COMPONENT =================
export function DashboardTabs({ stats, plData }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "revenue" | "profit-loss"
  >("revenue");

  const defaultPL: PLFormValues = {
    billingCycle: [{ id: "0", billedAmount: 0, otherCost: 0 }],
  };

  const form = useForm<PLFormValues>({
    defaultValues: plData ?? defaultPL,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "billingCycle",
  });

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(val) =>
          setActiveTab(val as "revenue" | "profit-loss")
        }
      >
        <TabsList variant="line">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="profit-loss">
            Profit & Loss
          </TabsTrigger>
        </TabsList>

        {/* ================= REVENUE TAB ================= */}
        <TabsContent value="revenue">
          <div className="space-y-4">

            {/* Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <p className="text-sm text-gray-500">Bill Count</p>
                <h2 className="text-2xl font-bold">
                  {stats.billCount || 0}
                </h2>
              </div>

              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <p className="text-sm text-gray-500">
                  Billing This Month ({stats.currentMonth})
                </p>
                <h2 className="text-2xl font-bold">
                  ₹{stats.billingThisMonth || 0}
                </h2>
              </div>

              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Billed Amount
                </p>
                <h2 className="text-2xl font-bold">
                  ₹{stats.totalBilledAmount || 0}
                </h2>
              </div>
            </div>

            {/* Charts */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Monthly Billing Trend
              </h3>
              <MonthlyBillingChartCard />
            </div>

            <div className="border rounded-lg p-6 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Billing Status
              </h3>
              <BillingStatusChart />
            </div>
          </div>
        </TabsContent>

        {/* ================= PROFIT & LOSS TAB ================= */}


        <TabsContent value="profit-loss">
          <Form {...form}>
            <div className="grid gap-6 w-full">

              

              {/* ✅ Top Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">

                <div className="p-4 border rounded-lg bg-white shadow-sm min-w-0">
                  <p className="text-sm text-gray-500">Bill Count</p>
                  <h2 className="text-2xl font-bold">
                    {stats.billCount || 0}
                  </h2>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm min-w-0">
                  <p className="text-sm text-gray-500">
                    Billing This Month ({stats.currentMonth})
                  </p>
                  <h2 className="text-2xl font-bold">
                    ₹{stats.billingThisMonth || 0}
                  </h2>
                </div>

                <div className="p-4 border rounded-lg bg-white shadow-sm min-w-0">
                  <p className="text-sm text-gray-500">
                    Total Billed Amount
                  </p>
                  <h2 className="text-2xl font-bold">
                    ₹{stats.totalBilledAmount || 0}
                  </h2>
                </div>

              </div>
              <div className="w-full min-w-0">
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Monthly Billing Trend
                  </h3>
                  <MonthlyPLChart plData={plData} />
                </div>
              </div>
              <div className="w-full min-w-0">
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Billing Status
                  </h3>
                  <PLStatusChart />
                </div>
              </div>
            </div>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
