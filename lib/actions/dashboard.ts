"use server";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// ================= TYPES =================
export interface DashboardStats {
  billCount: number;
  billingThisMonth: number;
  totalBilledAmount: number;
  totalCollectedAmount: number;
  totalOverdueAmount: number;
  collectionEfficiency: number;
  billGrowth: number; // ✅ new
  currentMonth: string;
}

// ================= COMMON HELPERS =================
function normalizeAmount(billed: number, collected: number) {
  const safeCollected = Math.min(collected, billed);
  const pending = billed - safeCollected;

  return { billed, collected: safeCollected, pending };
}

function getCycleDate(c: any): Date | null {
  return c.billingSubmittedDate ?? c.invoiceDate ?? c.paymentDueDate ?? null;
}

function calculateBillGrowth(currentMonthBilling: number, lastMonthBilling: number) {
  if (lastMonthBilling === 0) return 100;
  return ((currentMonthBilling - lastMonthBilling) / lastMonthBilling) * 100;
}

// ================= DASHBOARD STATS =================
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const cycles = await prisma.billingCycle.findMany({
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      billingSubmittedDate: true,
      invoiceDate: true,
      paymentDueDate: true,
    },
  });

  let totalBilled = 0;
  let totalCollected = 0;
  let totalOverdue = 0;

  let billedThisMonth = 0;
  let collectedThisMonth = 0;
  let billedLastMonth = 0;

  for (const c of cycles) {
    const billed = Number(c.invoiceAmount || 0);
    const rawCollected = Number(c.collectedAmount || 0);

    const { collected, pending } = normalizeAmount(billed, rawCollected);

    totalBilled += billed;
    totalCollected += collected;

    const date = getCycleDate(c);
    if (!date) continue;
    const d = new Date(date);

    // Current month
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      billedThisMonth += billed;
      collectedThisMonth += collected;
    }

    // Last month
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
      billedLastMonth += billed;
    }

    // Overdue
    if (c.paymentDueDate) {
      const due = new Date(c.paymentDueDate);
      due.setHours(0, 0, 0, 0);
      if (due < today && pending > 0) {
        totalOverdue += pending;
      }
    }
  }

  const collectionEfficiency = billedThisMonth
    ? Number(((collectedThisMonth / billedThisMonth) * 100).toFixed(2))
    : 0;

  const billGrowth = calculateBillGrowth(billedThisMonth, billedLastMonth);

  return {
    billCount: cycles.length,
    billingThisMonth: billedThisMonth,
    totalBilledAmount: totalBilled,
    totalCollectedAmount: totalCollected,
    totalOverdueAmount: totalOverdue,
    collectionEfficiency,
    billGrowth,
    currentMonth: now.toLocaleString("default", { month: "short" }),
  };
}

// ================= PIE CHART =================
export async function getBillingStatusData(year: number, month?: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycles = await prisma.billingCycle.findMany({
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      billingSubmittedDate: true,
      invoiceDate: true,
      paymentDueDate: true,
    },
  });

  let bill = 0;
  let paid = 0;
  let overdue = 0;

  for (const c of cycles) {
    const date = getCycleDate(c);
    if (!date) continue;

    const d = new Date(date);
    if (d.getFullYear() !== year) continue;
    if (month && d.getMonth() !== month - 1) continue;

    const billed = Number(c.invoiceAmount || 0);
    const rawCollected = Number(c.collectedAmount || 0);
    const { collected, pending } = normalizeAmount(billed, rawCollected);

    bill += billed;
    paid += collected;

    if (c.paymentDueDate) {
      const due = new Date(c.paymentDueDate);
      due.setHours(0, 0, 0, 0);
      if (due < today && pending > 0) {
        overdue += pending;
      }
    }
  }

  return [
    { status: "Bill Generated", value: bill },
    { status: "Payment Received", value: paid },
    { status: "Overdue", value: overdue },
  ];
}

// ================= MONTHLY CHART =================
export async function getMonthlyBillingData(year: number) {
  const now = new Date();
  const currentMonth = now.getMonth();

  const cycles = await prisma.billingCycle.findMany({
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      invoiceDate: true,
      billingSubmittedDate: true,
      paymentDueDate: true,
    },
  });

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const data = months.map((m, i) => ({
    month: m,
    billing: 0,
    payment: 0,
    overdue: 0,
    index: i,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  cycles.forEach((c) => {
    const date = c.invoiceDate ?? c.billingSubmittedDate;
    if (!date) return;

    const d = new Date(date);
    if (d.getFullYear() !== year) return;

    const i = d.getMonth();
    const billing = Number(c.invoiceAmount || 0);
    const paid = Number(c.collectedAmount || 0);

    data[i].billing += billing;
    data[i].payment += paid;

    if (c.paymentDueDate && paid < billing) {
      const due = new Date(c.paymentDueDate);
      due.setHours(0, 0, 0, 0);
      if (due < today) {
        data[i].overdue += billing - paid;
      }
    }
  });

  if (year === now.getFullYear()) {
    data.forEach((d) => {
      if (d.index > currentMonth) {
        d.billing = 0;
        d.payment = 0;
        d.overdue = 0;
      }
    });
  }

  return data;
}

// ================= UPCOMING PAYMENTS =================
export async function getUpcomingPayments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycles = await prisma.billingCycle.findMany({
    select: {
      invoiceNumber: true,
      invoiceAmount: true,
      collectedAmount: true,
      paymentDueDate: true,
    },
  });

  return cycles
    .map((c) => {
      const billed = Number(c.invoiceAmount || 0);
      const collected = Number(c.collectedAmount || 0);
      const pending = billed - collected;

      return {
        invoiceNumber: c.invoiceNumber || "-",
        paymentDueDate: c.paymentDueDate,
        invoiceAmount: pending,
      };
    })
    .filter((c) => c.paymentDueDate && new Date(c.paymentDueDate) >= today && c.invoiceAmount > 0)
    .sort((a, b) => new Date(a.paymentDueDate!).getTime() - new Date(b.paymentDueDate!).getTime());
}

// ================= TABLE DETAILS =================
export async function getBillingStatusDetails(status: string, year: number, month?: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycles = await prisma.billingCycle.findMany({
    include: {
      purchaseOrder: {
        include: {
          ServiceType: true,
          billingPlan: true,
          customer: true,
        },
      },
    },
  });

  return cycles
    .filter((cycle) => {
      const billed = Number(cycle.invoiceAmount || 0);
      const collected = Number(cycle.collectedAmount || 0);
      const { pending } = normalizeAmount(billed, collected);

      const date = getCycleDate(cycle);
      if (!date) return false;
      const d = new Date(date);

      if (d.getFullYear() !== year) return false;
      if (month && d.getMonth() !== month - 1) return false;

      if (status === "Bill Generated") return true;
      if (status === "Payment Received") return collected > 0;
      if (status === "Overdue") {
        if (!cycle.paymentDueDate) return false;
        const due = new Date(cycle.paymentDueDate);
        due.setHours(0, 0, 0, 0);
        return due < today && pending > 0;
      }

      return false;
    })
    .map((cycle) => ({
      id: cycle.id,
      poNumber: cycle.purchaseOrder.customerPONumber,
      invoiceNumber: cycle.invoiceNumber || "-",
      companyName: cycle.purchaseOrder.customer?.companyName || "-",
      serviceName: cycle.purchaseOrder.ServiceType?.name || "-",
      billingPlan: cycle.purchaseOrder.billingPlan?.name || "-",
      amount: Number(cycle.invoiceAmount || 0),
      startDate: cycle.purchaseOrder.startFrom
        ? format(new Date(cycle.purchaseOrder.startFrom), "dd/MM/yyyy")
        : "-",
      endDate: cycle.purchaseOrder.endDate
        ? format(new Date(cycle.purchaseOrder.endDate), "dd/MM/yyyy")
        : "-",
      extraAmount:
        status === "Payment Received"
          ? Number(cycle.collectedAmount || 0)
          : status === "Overdue"
          ? Number(cycle.invoiceAmount || 0) - Number(cycle.collectedAmount || 0)
          : 0,
    }));
}