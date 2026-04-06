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
  currentMonth: string;
}

// ================= HELPERS =================
function normalizeAmount(billed: number, collected: number) {
  const safeCollected = Math.min(collected, billed);
  const pending = billed - safeCollected;
  return { billed, collected: safeCollected, pending };
}

function getInvoiceDate(c: any): Date | null {
  // Always use invoiceDate first, then billingSubmittedDate
  return c.invoiceDate ?? c.billingSubmittedDate ?? c.paymentDueDate ?? null;
}


// ================= DASHBOARD STATS =================
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const cycles = await prisma.billingCycle.findMany({
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      invoiceDate: true,
      billingSubmittedDate: true,
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

    const date = getInvoiceDate(c);
    if (!date) continue;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // Current month
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      billedThisMonth += billed;
      collectedThisMonth += collected;
    }

    // Last month
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


  return {
    billCount: cycles.length,
    billingThisMonth: billedThisMonth,
    totalBilledAmount: totalBilled,
    totalCollectedAmount: totalCollected,
    totalOverdueAmount: totalOverdue,
    collectionEfficiency,
    currentMonth: now.toLocaleString("default", { month: "short" }),
  };
}

// ================= MONTHLY CHART =================
export async function getMonthlyBillingData(
  year: number,
  filters?: {
    company?: string;
    startDate?: Date;
    endDate?: Date;
    month?: string;
  }
) {
  const now = new Date();
  const currentMonth = now.getMonth();

  const cycles = await prisma.billingCycle.findMany({
    include: {
      purchaseOrder: {
        include: {
          company: true, // ✅ needed for company filter
        },
      },
    },
  });

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const data = months.map((m, i) => ({
    month: m,
    billing: 0,
    payment: 0,
    overdue: 0,
    index: i,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const c of cycles) {
    const date = c.invoiceDate ?? c.billingSubmittedDate ?? c.paymentDueDate;
    if (!date) continue;

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // ✅ Year filter
    if (d.getFullYear() !== year) continue;

    // ✅ Company filter
    if (filters?.company && filters.company !== "all") {
      const companyId = c.purchaseOrder?.company?.id;
      if (String(companyId) !== String(filters.company)) continue;
    }

    // ✅ Month filter
    if (filters?.month && filters.month !== "all") {
      if (d.getMonth() !== Number(filters.month)) continue;
    }

    // ✅ Date range filter
    if (filters?.startDate && d < filters.startDate) continue;
    if (filters?.endDate && d > filters.endDate) continue;

    const i = d.getMonth();

    const billed = Number(c.invoiceAmount || 0);
    const paid = Number(c.collectedAmount || 0);

    data[i].billing += billed;
    data[i].payment += paid;

    // ✅ Overdue logic
    if (c.paymentDueDate && paid < billed) {
      const due = new Date(c.paymentDueDate);
      due.setHours(0, 0, 0, 0);

      if (due < today) {
        data[i].overdue += billed - paid;
      }
    }
  }

  // ✅ Future months zero (same as your logic)
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

// ================= TABLE DETAILS =================
export async function getBillingStatusDetails(year: number, month?: number) {
  // Fetch billing cycles along with purchase order details
  const cycles = await prisma.billingCycle.findMany({
    include: {
      purchaseOrder: {
        include: {
          ServiceType: true,
          billingPlan: true,
          customer: true,
          company: true,
        },
      },
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cycles
    .filter((cycle) => {
      const date = cycle.invoiceDate ?? cycle.billingSubmittedDate ?? cycle.paymentDueDate;
      if (!date) return false;

      const d = new Date(date);
      if (d.getFullYear() !== year) return false;
      if (month !== undefined && month !== null && d.getMonth() !== month) return false;

      return true;
    })
    .map((cycle) => {
      const start = cycle.purchaseOrder?.startFrom ? new Date(cycle.purchaseOrder.startFrom) : null;
      const end = cycle.purchaseOrder?.endDate ? new Date(cycle.purchaseOrder.endDate) : null;

      // Contract duration in months
      let contractDuration = "-";
      if (start && end) {
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        contractDuration = `${months + 1} months`;
      }

      const billed = Number(cycle.invoiceAmount || 0);
      const collected = Number(cycle.collectedAmount || 0);
      const overdue = Math.max(billed - collected, 0);

      return {
        id: cycle.id,
        poNumber: cycle.purchaseOrder?.customerPONumber || "-",
        invoiceNumber: cycle.invoiceNumber || "-",
        companyId: cycle.purchaseOrder?.company?.id || null,
        companyName: cycle.purchaseOrder?.company?.name || "-",
        serviceType: cycle.purchaseOrder?.ServiceType?.name || "-",
        billingPlan: cycle.purchaseOrder?.billingPlan?.name || "-",
        amount: billed,
        collectedAmount: collected,   // ✅ include collected
        overdueAmount: overdue,      // ✅ include overdue
        status: cycle.purchaseOrder?.status || "-",
        startDate: start ? format(start, "dd/MM/yyyy") : "-",
        endDate: end ? format(end, "dd/MM/yyyy") : "-",
        contractDuration,
      };
    });
}