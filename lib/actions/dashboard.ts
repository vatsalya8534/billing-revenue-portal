"use server";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { getFinancialYearRange } from "@/lib/date-utils";

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

interface BillingStatusFilters {
  company?: string;
  startDate?: Date;
  endDate?: Date;
  month?: string;
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
  const currentYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
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

  // Current month
  const { start, end } = getFinancialYearRange(currentYear);

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



    // Only count data inside FY
    if (d >= start && d <= end) {
      const currentFYMonth = (currentMonth + 9) % 12;
      const dataFYMonth = (d.getMonth() + 9) % 12;

      if (dataFYMonth === currentFYMonth) {
        billedThisMonth += billed;
        collectedThisMonth += collected;
      }
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
  const { start, end } = getFinancialYearRange(year);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ================= FETCH (WITH FILTERS) =================
  const cycles = await prisma.billingCycle.findMany({
    where: {
      // ✅ FY filter
      OR: [
        {
          invoiceDate: {
            gte: start,
            lte: end,
          },
        },
        {
          billingSubmittedDate: {
            gte: start,
            lte: end,
          },
        },
        {
          paymentDueDate: {
            gte: start,
            lte: end,
          },
        },
      ],

      // ✅ Company filter
      ...(filters?.company &&
        filters.company !== "all" && {
          purchaseOrder: {
            companyId: filters.company,
          },
        }),
    },
    include: {
      purchaseOrder: {
        include: {
          company: true,
        },
      },
    },
  });

  // ================= MONTH SETUP =================
  const months = [
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
  ];

  const data = months.map((m, i) => ({
    month: m,
    billing: 0,
    payment: 0,
    overdue: 0,
    index: i,
  }));

  // ================= PROCESS =================
  for (const c of cycles) {
    const date =
      c.invoiceDate ??
      c.billingSubmittedDate ??
      c.paymentDueDate;

    if (!date) continue;

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // ✅ Extra date range filter (optional UI filter)
    if (filters?.startDate && d < filters.startDate) continue;
    if (filters?.endDate && d > filters.endDate) continue;

    const fyMonth = (d.getMonth() + 9) % 12;

    // ✅ Month filter
    if (
      filters?.month &&
      filters.month !== "all" &&
      fyMonth !== Number(filters.month)
    ) {
      continue;
    }

    const billed = Number(c.invoiceAmount || 0);
    const paid = Number(c.collectedAmount || 0);

    data[fyMonth].billing += billed;
    data[fyMonth].payment += paid;

    // ✅ Overdue
    if (c.paymentDueDate && paid < billed) {
      const due = new Date(c.paymentDueDate);
      due.setHours(0, 0, 0, 0);

      if (due < today) {
        data[fyMonth].overdue += billed - paid;
      }
    }
  }

  // ================= FUTURE MONTH BLOCK =================
  const now = new Date();
  const currentFYMonth = (now.getMonth() + 9) % 12;
  const currentFYYear =
    now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();

  if (year === currentFYYear) {
    data.forEach((d) => {
      if (d.index > currentFYMonth) {
        d.billing = 0;
        d.payment = 0;
        d.overdue = 0;
      }
    });
  }

  return data;
}

// ================= TABLE DETAILS =================
export async function getBillingStatusDetails(
  year: number,
  filters?: BillingStatusFilters
) {
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
  const { start, end } = getFinancialYearRange(year);

  return cycles
    .filter((cycle) => {
      const date = cycle.invoiceDate ?? cycle.billingSubmittedDate ?? cycle.paymentDueDate;
      if (!date) return false;

      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      if (d < start || d > end) return false;
      if (
        filters?.company &&
        filters.company !== "all" &&
        String(cycle.purchaseOrder?.company?.id) !== filters.company
      ) {
        return false;
      }

      if (filters?.startDate) {
        const filterStart = new Date(filters.startDate);
        filterStart.setHours(0, 0, 0, 0);
        if (d < filterStart) return false;
      }

      if (filters?.endDate) {
        const filterEnd = new Date(filters.endDate);
        filterEnd.setHours(23, 59, 59, 999);
        if (d > filterEnd) return false;
      }

      if (filters?.month && filters.month !== "all") {
        const fyMonth = (d.getMonth() + 9) % 12;
        if (fyMonth !== Number(filters.month)) return false;
      }

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
