"use client"

import * as React from "react"

import { toast } from "sonner"
import { getUsersColumns } from "./column";
import { DataTable } from "@/components/datatable/DataTable";
import { deletePurchaseOrder } from "@/lib/actions/purschase-order";
import { BadgeIndianRupee, CircleDollarSign, ReceiptText, TrendingUp } from "lucide-react";

type BillingCycleRow = {
  collectedAmount?: number | null;
};

type RevenueRow = {
  id: string;
  poAmount?: number | null;
  status?: string | null;
  company?: { name?: string | null } | null;
  billingCycles?: BillingCycleRow[] | null;
};

type RevenueDataTableProps = {
  data: RevenueRow[];
  canEdit: boolean;
  canDelete: boolean;
  title: string;
  actions?: React.ReactNode;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-sky-100/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(14,116,144,0.10)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="text-sm text-slate-500">{helper}</p>
        </div>

        <div className={`rounded-2xl border p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function RevenueDataTable({
    data,
    canEdit,
    canDelete,
    title,
    actions
}: RevenueDataTableProps) {
    const [tableData, setTableData] = React.useState(data);

    const metrics = React.useMemo(() => {
        const totalRevenue = tableData.reduce(
            (sum, item) => sum + Number(item.poAmount || 0),
            0
        );
        const totalCollected = tableData.reduce((sum, item) => {
            const collected = (item.billingCycles || []).reduce(
                (cycleSum, cycle) =>
                    cycleSum + Number(cycle.collectedAmount || 0),
                0
            );

            return sum + collected;
        }, 0);
        const liveCount = tableData.filter((item) => item.status === "LIVE").length;
        const companyCount = new Set(
            tableData.map((item) => item.company?.name).filter(Boolean)
        ).size;
        const pendingRevenue = Math.max(totalRevenue - totalCollected, 0);
        const collectionRate =
            totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;

        return {
            totalRevenue,
            totalCollected,
            liveCount,
            companyCount,
            pendingRevenue,
            collectionRate,
        };
    }, [tableData]);

    const deleteHandler = async (id: string) => {
        const res = await deletePurchaseOrder(id);

        if (!res?.success) {
            toast.error("Error", { description: res?.message });
            return;
        }

        toast.success("Success", { description: res?.message });

        setTableData((prev) =>
            prev.filter((r) => r.id !== id)
        );
    };

    const columns = getUsersColumns({
        canEdit,
        canDelete,
        onDelete: deleteHandler,
    });

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[32px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-[0_16px_50px_rgba(14,116,144,0.12)]">
                <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_62%)]" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl space-y-3">
                        <div className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm">
                            Revenue Command Center
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
                                Revenue operations with cleaner signals, clearer ownership, and SaaS-grade visibility.
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                                Review purchase orders, monitor collections, and act on pending revenue from one polished workspace styled to match the P&amp;L dashboard.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-2xl border border-sky-100 bg-white/85 px-4 py-3 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Collection Rate</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                    {metrics.collectionRate}%
                                </p>
                            </div>
                            <div className="rounded-2xl border border-sky-100 bg-white/85 px-4 py-3 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Active Companies</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                    {metrics.companyCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid w-full gap-4 sm:grid-cols-2 xl:max-w-xl">
                        <StatCard
                            label="Booked Revenue"
                            value={`₹ ${formatCurrency(metrics.totalRevenue)}`}
                            helper={`${tableData.length} purchase orders in pipeline`}
                            icon={BadgeIndianRupee}
                            accent="border-sky-200 bg-sky-50 text-sky-700"
                        />
                        <StatCard
                            label="Collected"
                            value={`₹ ${formatCurrency(metrics.totalCollected)}`}
                            helper={`${metrics.collectionRate}% realization across all orders`}
                            icon={TrendingUp}
                            accent="border-emerald-200 bg-emerald-50 text-emerald-700"
                        />
                        <StatCard
                            label="Pending"
                            value={`₹ ${formatCurrency(metrics.pendingRevenue)}`}
                            helper="Outstanding revenue that still needs follow-up"
                            icon={CircleDollarSign}
                            accent="border-amber-200 bg-amber-50 text-amber-700"
                        />
                        <StatCard
                            label="Live Orders"
                            value={String(metrics.liveCount)}
                            helper="Currently active revenue contracts"
                            icon={ReceiptText}
                            accent="border-indigo-200 bg-indigo-50 text-indigo-700"
                        />
                    </div>
                </div>
            </section>

            <div
                className="
                    rounded-3xl
                    border border-white/10 dark:border-white/5
                    bg-gradient-to-br from-background via-background to-muted/30
                    backdrop-blur-xl
                    shadow-[0_8px_30px_rgb(0,0,0,0.08)]
                    overflow-hidden
                "
            >
                <DataTable
                    data={tableData}
                    columns={columns}
                    title={title}
                    actions={actions}
                    rowClassName={(row) => {
                        const billed = Number(row.poAmount) || 0;
                        const collected = (row.billingCycles || []).reduce(
                            (sum, cycle) => sum + Number(cycle.collectedAmount || 0),
                            0
                        );
                        const realization = billed > 0 ? (collected / billed) * 100 : 0;
                        const isLive = row.status === "LIVE";

                        if (realization >= 85) {
                            return `
                                bg-emerald-50/70
                                dark:bg-emerald-950/20
                                hover:bg-emerald-100/80
                                dark:hover:bg-emerald-900/30
                                hover:scale-[1.01]
                                hover:shadow-md
                                transition-all duration-300
                                border-l-4 border-emerald-500
                            `;
                        }

                        if (isLive) {
                            return `
                                bg-amber-50/80
                                dark:bg-amber-950/20
                                hover:bg-amber-100/80
                                dark:hover:bg-amber-900/30
                                hover:scale-[1.01]
                                hover:shadow-md
                                transition-all duration-300
                                border-l-4 border-amber-500
                            `;
                        }

                        return `
                            bg-slate-50/80
                            dark:bg-slate-900/40
                            hover:bg-slate-100/80
                            dark:hover:bg-slate-800/50
                            hover:scale-[1.01]
                            hover:shadow-md
                            transition-all duration-300
                            border-l-4 border-slate-400
                        `;
                    }}
                    className="
                        [&_table]:border-separate
                        [&_table]:border-spacing-y-1
                        [&_tbody_tr]:rounded-xl
                        [&_tbody_tr]:shadow-sm
                        [&_tbody_tr]:overflow-hidden
                        [&_tbody_tr]:animate-in
                        [&_tbody_tr]:fade-in
                        [&_tbody_tr]:slide-in-from-bottom-1
                        [&_tbody_tr:nth-child(even)]:bg-muted/20
                        [&_tbody_td]:px-4
                        [&_tbody_td]:py-3
                        [&_tbody_td]:text-sm
                    "
                />
            </div>
        </div>
    );
}
