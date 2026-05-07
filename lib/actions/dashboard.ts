"use server";

import { format } from "date-fns";

import { getFinancialYearRange } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

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

type RevenueSeries = "billing" | "payment";

type RevenueMonthDetailsParams = {
  month: number;
  year: number;
  series: RevenueSeries;
};

export type RevenueMonthDetail = {
  id: string;
  month: string;
  year: number;
  companyName: string;
  customerName: string;
  poNumber: string;
  invoiceNumber: string;
  billedAmount: number;
  paymentReceived: number;
  pendingAmount: number;
};

function normalizeAmount(billed: number, collected: number) {
  const safeCollected = Math.min(collected, billed);
  const pending = billed - safeCollected;
  return { billed, collected: safeCollected, pending };
}

function normalizeDate(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getInvoiceDate(cycle: any): Date | null {
  return (
    cycle.invoiceDate ??
    cycle.billingSubmittedDate ??
    cycle.paymentDueDate ??
    null
  );
}

function getPaymentDate(cycle: any): Date | null {
  return (
    cycle.paymentReceivedDate ??
    cycle.invoiceDate ??
    cycle.billingSubmittedDate ??
    cycle.paymentDueDate ??
    null
  );
}

function getSeriesDate(
  cycle: any,
  series: RevenueSeries,
) {
  return series === "payment"
    ? getPaymentDate(cycle)
    : getInvoiceDate(cycle);
}

function getFinancialMonthRange(year: number, month: number) {
  const calendarMonth = month <= 8 ? month + 3 : month - 9;
  const calendarYear = month <= 8 ? year : year + 1;

  const start = new Date(calendarYear, calendarMonth, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(calendarYear, calendarMonth + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { calendarMonth, calendarYear, end, start };
}

function isWithinFilterDateRange(
  date: Date,
  filters?: BillingStatusFilters,
) {
  if (filters?.startDate) {
    const filterStart = normalizeDate(
      new Date(filters.startDate),
    );
    if (date < filterStart) return false;
  }

  if (filters?.endDate) {
    const filterEnd = new Date(filters.endDate);
    filterEnd.setHours(23, 59, 59, 999);
    if (date > filterEnd) return false;
  }

  return true;
}

function matchesFilterMonth(
  date: Date,
  filters?: BillingStatusFilters,
) {
  if (!filters?.month || filters.month === "all") {
    return true;
  }

  const fyMonth = (date.getMonth() + 9) % 12;
  return fyMonth === Number(filters.month);
}

function matchesCompanyFilter(
  cycle: any,
  filters?: BillingStatusFilters,
) {
  if (!filters?.company || filters.company === "all") {
    return true;
  }

  return (
    String(cycle.purchaseOrder?.company?.id) ===
    filters.company
  );
}

function getCustomerDisplayName(
  customer?: {
    companyName?: string | null;
    customerCode?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null,
) {
  if (!customer) return "-";

  if (customer.companyName?.trim()) {
    return customer.companyName;
  }

  const fullName = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || customer.customerCode || "-";
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const today = normalizeDate(new Date());
  const currentMonth = now.getMonth();
  const currentYear =
    now.getMonth() < 3
      ? now.getFullYear() - 1
      : now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear =
    currentMonth === 0 ? currentYear - 1 : currentYear;

  const cycles = await prisma.billingCycle.findMany({
    select: {
      billingSubmittedDate: true,
      collectedAmount: true,
      invoiceAmount: true,
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

  const { start, end } = getFinancialYearRange(currentYear);

  for (const cycle of cycles) {
    const billed = Number(cycle.invoiceAmount || 0);
    const rawCollected = Number(cycle.collectedAmount || 0);
    const { collected, pending } = normalizeAmount(
      billed,
      rawCollected,
    );

    totalBilled += billed;
    totalCollected += collected;

    const date = getInvoiceDate(cycle);
    if (!date) continue;

    const normalizedDate = normalizeDate(new Date(date));

    if (normalizedDate >= start && normalizedDate <= end) {
      const currentFYMonth = (currentMonth + 9) % 12;
      const dataFYMonth =
        (normalizedDate.getMonth() + 9) % 12;

      if (dataFYMonth === currentFYMonth) {
        billedThisMonth += billed;
        collectedThisMonth += collected;
      }
    }

    if (
      normalizedDate.getMonth() === lastMonth &&
      normalizedDate.getFullYear() === lastMonthYear
    ) {
      billedLastMonth += billed;
    }

    if (cycle.paymentDueDate) {
      const due = normalizeDate(
        new Date(cycle.paymentDueDate),
      );

      if (due < today && pending > 0) {
        totalOverdue += pending;
      }
    }
  }

  const collectionEfficiency = billedThisMonth
    ? Number(
        (
          (collectedThisMonth / billedThisMonth) *
          100
        ).toFixed(2),
      )
    : 0;

  return {
    billCount: cycles.length,
    billingThisMonth: billedThisMonth,
    totalBilledAmount: totalBilled,
    totalCollectedAmount: totalCollected,
    totalOverdueAmount: totalOverdue,
    collectionEfficiency,
    currentMonth: now.toLocaleString("default", {
      month: "short",
    }),
  };
}

export async function getMonthlyBillingData(
  year: number,
  filters?: BillingStatusFilters,
) {
  const { start, end } = getFinancialYearRange(year);
  const today = normalizeDate(new Date());

  const cycles = await prisma.billingCycle.findMany({
    where: {
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
        {
          paymentReceivedDate: {
            gte: start,
            lte: end,
          },
        },
      ],
      ...(filters?.company &&
        filters.company !== "all" && {
          purchaseOrder: {
            companyId: filters.company,
          },
        }),
    },
  });

  const months = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];

  const data = months.map((month, index) => ({
    month,
    billing: 0,
    payment: 0,
    overdue: 0,
    index,
  }));

  for (const cycle of cycles) {
    const billed = Number(cycle.invoiceAmount || 0);
    const paid = Number(cycle.collectedAmount || 0);

    const billingDate = getInvoiceDate(cycle);
    if (billingDate) {
      const normalizedBillingDate = normalizeDate(
        new Date(billingDate),
      );

      if (
        isWithinFilterDateRange(
          normalizedBillingDate,
          filters,
        ) &&
        matchesFilterMonth(normalizedBillingDate, filters)
      ) {
        const fyMonth =
          (normalizedBillingDate.getMonth() + 9) % 12;

        data[fyMonth].billing += billed;

        if (cycle.paymentDueDate && paid < billed) {
          const due = normalizeDate(
            new Date(cycle.paymentDueDate),
          );

          if (due < today) {
            data[fyMonth].overdue += billed - paid;
          }
        }
      }
    }

    const paymentDate = getPaymentDate(cycle);
    if (paid > 0 && paymentDate) {
      const normalizedPaymentDate = normalizeDate(
        new Date(paymentDate),
      );

      if (
        isWithinFilterDateRange(
          normalizedPaymentDate,
          filters,
        ) &&
        matchesFilterMonth(normalizedPaymentDate, filters)
      ) {
        const fyMonth =
          (normalizedPaymentDate.getMonth() + 9) % 12;

        data[fyMonth].payment += paid;
      }
    }
  }

  const currentDate = new Date();
  const currentFYMonth =
    (currentDate.getMonth() + 9) % 12;
  const currentFYYear =
    currentDate.getMonth() < 3
      ? currentDate.getFullYear() - 1
      : currentDate.getFullYear();

  if (year === currentFYYear) {
    data.forEach((entry) => {
      if (entry.index > currentFYMonth) {
        entry.billing = 0;
        entry.payment = 0;
        entry.overdue = 0;
      }
    });
  }

  return data;
}

export async function getBillingStatusDetails(
  year: number,
  filters?: BillingStatusFilters,
) {
  const { start, end } = getFinancialYearRange(year);

  const cycles = await prisma.billingCycle.findMany({
    include: {
      purchaseOrder: {
        include: {
          ServiceType: true,
          billingPlan: true,
          company: true,
          customer: true, // ✅ required for customerName
        },
      },
    },
  });

  return cycles
    .filter((cycle) => {
      const date = getInvoiceDate(cycle);
      if (!date) return false;

      const normalizedDate = normalizeDate(new Date(date));

      // FY filter
      if (normalizedDate < start || normalizedDate > end) {
        return false;
      }

      // Company filter
      if (!matchesCompanyFilter(cycle, filters)) {
        return false;
      }

      // Date range filter
      if (
        !isWithinFilterDateRange(
          normalizedDate,
          filters,
        )
      ) {
        return false;
      }

      // Month filter
      return matchesFilterMonth(normalizedDate, filters);
    })
    .map((cycle) => {
      const orderStart = cycle.purchaseOrder?.startFrom
        ? new Date(cycle.purchaseOrder.startFrom)
        : null;

      const orderEnd = cycle.purchaseOrder?.endDate
        ? new Date(cycle.purchaseOrder.endDate)
        : null;

      // Contract duration
      let contractDuration = "-";
      if (orderStart && orderEnd) {
        const months =
          (orderEnd.getFullYear() - orderStart.getFullYear()) * 12 +
          (orderEnd.getMonth() - orderStart.getMonth());

        contractDuration = `${months + 1} months`;
      }

      const billed = Number(cycle.invoiceAmount || 0);
      const collected = Number(cycle.collectedAmount || 0);
      const overdue = Math.max(billed - collected, 0);

      return {
        id: cycle.id,

        // 🔥 IMPORTANT FIX
        customerName: getCustomerDisplayName(
          cycle.purchaseOrder?.customer
        ),

        companyId:
          cycle.purchaseOrder?.company?.id || null,

        companyName:
          cycle.purchaseOrder?.company?.name || "-",

        poNumber:
          cycle.purchaseOrder?.customerPONumber || "-",

        invoiceNumber:
          cycle.invoiceNumber || "-",

        amount: billed,
        collectedAmount: collected,
        overdueAmount: overdue,

        serviceType:
          cycle.purchaseOrder?.ServiceType?.name || "-",

        billingPlan:
          cycle.purchaseOrder?.billingPlan?.name || "-",

        contractDuration,

        startDate: orderStart
          ? format(orderStart, "dd/MM/yyyy")
          : "-",

        endDate: orderEnd
          ? format(orderEnd, "dd/MM/yyyy")
          : "-",

        status:
          cycle.purchaseOrder?.status || "-",
      };
    });
}

export async function getRevenueDetailsByMonth(
  params: RevenueMonthDetailsParams,
  filters?: BillingStatusFilters,
): Promise<RevenueMonthDetail[]> {
  const { start, end } = getFinancialMonthRange(
    params.year,
    params.month,
  );

  const cycles = await prisma.billingCycle.findMany({
    where: {
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
        {
          paymentReceivedDate: {
            gte: start,
            lte: end,
          },
        },
      ],
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
          customer: true,
        },
      },
    },
  });

  return cycles
    .filter((cycle) => {
      if (!matchesCompanyFilter(cycle, filters)) {
        return false;
      }

      const seriesDate = getSeriesDate(
        cycle,
        params.series,
      );
      if (!seriesDate) return false;

      const normalizedSeriesDate = normalizeDate(
        new Date(seriesDate),
      );

      if (
        normalizedSeriesDate < start ||
        normalizedSeriesDate > end
      ) {
        return false;
      }

      if (
        !isWithinFilterDateRange(
          normalizedSeriesDate,
          filters,
        )
      ) {
        return false;
      }

      if (
        !matchesFilterMonth(
          normalizedSeriesDate,
          filters,
        )
      ) {
        return false;
      }

      if (
        params.series === "payment" &&
        Number(cycle.collectedAmount || 0) <= 0
      ) {
        return false;
      }

      return true;
    })
    .map((cycle) => {
      const billedAmount = Number(
        cycle.invoiceAmount || 0,
      );
      const paymentReceived = Number(
        cycle.collectedAmount || 0,
      );
      const pendingAmount = Math.max(
        billedAmount - paymentReceived,
        0,
      );
      const seriesDate =
        getSeriesDate(cycle, params.series) || start;

      return {
        billedAmount,
        companyName:
          cycle.purchaseOrder?.company?.name || "-",
        customerName: getCustomerDisplayName(
          cycle.purchaseOrder?.customer,
        ),
        id: cycle.id,
        invoiceNumber: cycle.invoiceNumber || "-",
        month: format(seriesDate, "MMM"),
        paymentReceived,
        pendingAmount,
        poNumber:
          cycle.purchaseOrder?.customerPONumber || "-",
        year: new Date(seriesDate).getFullYear(),
      };
    })
    .sort((left, right) => {
      return (
        left.companyName.localeCompare(
          right.companyName,
        ) ||
        left.customerName.localeCompare(
          right.customerName,
        ) ||
        left.poNumber.localeCompare(right.poNumber) ||
        left.invoiceNumber.localeCompare(
          right.invoiceNumber,
        )
      );
    });
}
