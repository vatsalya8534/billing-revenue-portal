"use server";

import { format } from "date-fns";
import { PaymentReceived } from "@prisma/client";

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

const MONTHS = [
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

function normalizeDate(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getCurrentFinancialYear(date = new Date()) {
  return date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear();
}

function getFinancialYearRange(year: number) {
  const start = new Date(year, 3, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(year + 1, 2, 31, 23, 59, 59, 999);

  return { start, end };
}

function getFinancialMonth(date: Date) {
  return (date.getMonth() + 9) % 12;
}

function getFinancialMonthRange(financialYear: number, monthIndex: number) {
  const calendarMonth = monthIndex <= 8 ? monthIndex + 3 : monthIndex - 9;

  const calendarYear = monthIndex <= 8 ? financialYear : financialYear + 1;

  const start = new Date(calendarYear, calendarMonth, 1);

  start.setHours(0, 0, 0, 0);

  const end = new Date(calendarYear, calendarMonth + 1, 0, 23, 59, 59, 999);

  return {
    start,
    end,
  };
}

function getInvoiceDate(cycle: any): Date | null {
  return cycle.invoiceDate ?? cycle.billingSubmittedDate ?? null;
}

/**
 * IMPORTANT:
 * If payment status is YES
 * we MUST show payment revenue.
 *
 * So fallback order:
 * paymentReceivedDate
 * -> invoiceDate
 * -> billingSubmittedDate
 */
function getPaymentDate(cycle: any): Date | null {
  if (cycle.paymentReceived === PaymentReceived.YES) {
    return (
      cycle.paymentReceivedDate ??
      cycle.invoiceDate ??
      cycle.billingSubmittedDate ??
      null
    );
  }

  return null;
}

/**
 * IMPORTANT:
 * If status YES but collectedAmount missing,
 * use invoiceAmount as fallback.
 */
function getEffectiveCollectedAmount(cycle: any) {
  const collected = Number(cycle.collectedAmount || 0);

  if (cycle.paymentReceived === PaymentReceived.YES && collected <= 0) {
    return Number(cycle.invoiceAmount || 0);
  }

  return collected;
}

function matchesCompanyFilter(cycle: any, filters?: BillingStatusFilters) {
  if (!filters?.company || filters.company === "all") {
    return true;
  }

  return String(cycle.purchaseOrder?.company?.id) === filters.company;
}

function matchesFilterMonth(date: Date, filters?: BillingStatusFilters) {
  if (!filters?.month || filters.month === "all") {
    return true;
  }

  return getFinancialMonth(date) === Number(filters.month);
}

function isWithinFilterDateRange(date: Date, filters?: BillingStatusFilters) {
  if (filters?.startDate) {
    const startDate = normalizeDate(new Date(filters.startDate));

    if (date < startDate) {
      return false;
    }
  }

  if (filters?.endDate) {
    const endDate = new Date(filters.endDate);

    endDate.setHours(23, 59, 59, 999);

    if (date > endDate) {
      return false;
    }
  }

  return true;
}

function getCustomerDisplayName(customer?: any) {
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
  const currentFY = getCurrentFinancialYear();

  const { start, end } = getFinancialYearRange(currentFY);

  const currentMonth = getFinancialMonth(new Date());

  const cycles = await prisma.billingCycle.findMany();

  let billCount = 0;
  let totalBilledAmount = 0;
  let totalCollectedAmount = 0;
  let totalOverdueAmount = 0;
  let billingThisMonth = 0;
  let collectedThisMonth = 0;

  for (const cycle of cycles) {
    const invoiceDate = getInvoiceDate(cycle);

    if (!invoiceDate) continue;

    const normalizedDate = normalizeDate(invoiceDate);

    if (normalizedDate < start || normalizedDate > end) {
      continue;
    }

    const billed = Number(cycle.invoiceAmount || 0);

    const collected = getEffectiveCollectedAmount(cycle);

    totalBilledAmount += billed;
    totalCollectedAmount += collected;

    billCount++;

    if (getFinancialMonth(normalizedDate) === currentMonth) {
      billingThisMonth += billed;
      collectedThisMonth += collected;
    }

    const pending = Math.max(billed - collected, 0);

    if (cycle.paymentDueDate && pending > 0) {
      const dueDate = normalizeDate(cycle.paymentDueDate);

      if (dueDate < normalizeDate(new Date())) {
        totalOverdueAmount += pending;
      }
    }
  }

  return {
    billCount,
    billingThisMonth,
    totalBilledAmount,
    totalCollectedAmount,
    totalOverdueAmount,
    collectionEfficiency:
      billingThisMonth > 0
        ? Number(((collectedThisMonth / billingThisMonth) * 100).toFixed(2))
        : 0,
    currentMonth: format(new Date(), "MMM"),
  };
}

export async function getMonthlyBillingData(
  year: number,
  filters?: BillingStatusFilters,
) {
  const { start, end } = getFinancialYearRange(year);

  const currentDate = new Date();

  const currentFY = getCurrentFinancialYear(currentDate);

  const currentFYMonth = getFinancialMonth(currentDate);

  const today = normalizeDate(new Date());

  const cycles = await prisma.billingCycle.findMany({
    where: {
      ...(filters?.company &&
        filters.company !== "all" && {
          purchaseOrder: {
            companyId: filters.company,
          },
        }),
    },
  });

  const data = MONTHS.map((month, index) => ({
    month,
    billing: 0,
    payment: 0,
    overdue: 0,
    index,
  }));

  for (const cycle of cycles) {
    const billed = Number(cycle.invoiceAmount || 0);

    const collected = getEffectiveCollectedAmount(cycle);

    const invoiceDate = getInvoiceDate(cycle);

    if (invoiceDate) {
      const normalizedInvoiceDate = normalizeDate(invoiceDate);

      const fyMonth = getFinancialMonth(normalizedInvoiceDate);

      const isFutureMonth = year === currentFY && fyMonth > currentFYMonth;

      if (
        !isFutureMonth &&
        normalizedInvoiceDate >= start &&
        normalizedInvoiceDate <= end &&
        isWithinFilterDateRange(normalizedInvoiceDate, filters) &&
        matchesFilterMonth(normalizedInvoiceDate, filters)
      ) {
        data[fyMonth].billing += billed;

        const pending = Math.max(billed - collected, 0);

        if (cycle.paymentDueDate && pending > 0) {
          const dueDate = normalizeDate(cycle.paymentDueDate);

          if (dueDate < today) {
            data[fyMonth].overdue += pending;
          }
        }
      }
    }
    if (cycle.paymentReceived === PaymentReceived.YES) {
      const paymentDate = getPaymentDate(cycle);

      if (paymentDate && collected > 0) {
        const normalizedPaymentDate = normalizeDate(paymentDate);

        const fyMonth = getFinancialMonth(normalizedPaymentDate);
        const isFutureMonth = year === currentFY && fyMonth > currentFYMonth;

        if (
          !isFutureMonth &&
          normalizedPaymentDate >= start &&
          normalizedPaymentDate <= end &&
          isWithinFilterDateRange(normalizedPaymentDate, filters) &&
          matchesFilterMonth(normalizedPaymentDate, filters)
        ) {
          data[fyMonth].payment += collected;
        }
      }
    }
  }

  if (year === currentFY) {
    data.forEach((item) => {
      if (item.index > currentFYMonth) {
        item.billing = 0;
        item.payment = 0;
        item.overdue = 0;
      }
    });
  }

  return data;
}

export async function getBillingStatusDetails(
  year?: number,
  filters?: BillingStatusFilters,
) {
  const cycles = await prisma.billingCycle.findMany({
    include: {
      purchaseOrder: {
        include: {
          ServiceType: true,
          billingPlan: true,
          company: true,
          customer: true,
        },
      },
    },
  });

  return cycles
    .filter((cycle) => {
      const invoiceDate = getInvoiceDate(cycle);

      if (!invoiceDate) {
        return false;
      }

      const normalizedDate = normalizeDate(invoiceDate);

      if (typeof year === "number") {
        const fyRange = getFinancialYearRange(year);

        if (normalizedDate < fyRange.start || normalizedDate > fyRange.end) {
          return false;
        }
      }

      if (!matchesCompanyFilter(cycle, filters)) {
        return false;
      }

      if (!isWithinFilterDateRange(normalizedDate, filters)) {
        return false;
      }

      if (!matchesFilterMonth(normalizedDate, filters)) {
        return false;
      }

      return true;
    })
    .map((cycle) => {
      const billed = Number(cycle.invoiceAmount || 0);

      const collected = getEffectiveCollectedAmount(cycle);

      const overdue = Math.max(billed - collected, 0);

      const orderStart = cycle.purchaseOrder?.startFrom;

      const orderEnd = cycle.purchaseOrder?.endDate;

      let contractDuration = "-";

      if (orderStart && orderEnd) {
        const months =
          (orderEnd.getFullYear() - orderStart.getFullYear()) * 12 +
          (orderEnd.getMonth() - orderStart.getMonth());

        contractDuration = `${months + 1} months`;
      }

      return {
        id: cycle.id,

        customerName: getCustomerDisplayName(cycle.purchaseOrder?.customer),

        companyId: cycle.purchaseOrder?.company?.id || null,

        companyName: cycle.purchaseOrder?.company?.name || "-",

        poNumber: cycle.purchaseOrder?.customerPONumber || "-",

        invoiceNumber: cycle.invoiceNumber || "-",

        amount: billed,

        collectedAmount: collected,

        overdueAmount: overdue,

        serviceType: cycle.purchaseOrder?.ServiceType?.name || "-",

        billingPlan: cycle.purchaseOrder?.billingPlan?.name || "-",

        contractDuration,

        startDate: orderStart ? format(orderStart, "dd/MM/yyyy") : "-",

        endDate: orderEnd ? format(orderEnd, "dd/MM/yyyy") : "-",

        status: cycle.purchaseOrder?.status || "-",
      };
    });
}

export async function getRevenueDetailsByMonth(
  params: RevenueMonthDetailsParams,
  filters?: BillingStatusFilters,
): Promise<RevenueMonthDetail[]> {
  const { start, end } = getFinancialMonthRange(params.year, params.month);

  const cycles = await prisma.billingCycle.findMany({
    where: {
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
      const seriesDate =
        params.series === "payment"
          ? getPaymentDate(cycle)
          : getInvoiceDate(cycle);

      if (!seriesDate) {
        return false;
      }

      const normalizedDate = normalizeDate(seriesDate);

      if (normalizedDate < start || normalizedDate > end) {
        return false;
      }

      if (!matchesCompanyFilter(cycle, filters)) {
        return false;
      }

      if (!isWithinFilterDateRange(normalizedDate, filters)) {
        return false;
      }

      if (
        params.series === "payment" &&
        cycle.paymentReceived !== PaymentReceived.YES
      ) {
        return false;
      }

      return true;
    })
    .map((cycle) => {
      const billedAmount = Number(cycle.invoiceAmount || 0);

      const paymentReceived = getEffectiveCollectedAmount(cycle);

      const pendingAmount = billedAmount - paymentReceived;

      const seriesDate =
        params.series === "payment"
          ? getPaymentDate(cycle)
          : getInvoiceDate(cycle);

      return {
        id: cycle.id,

        month: format(seriesDate || new Date(), "MMM"),

        year: new Date(seriesDate || new Date()).getFullYear(),

        companyName: cycle.purchaseOrder?.company?.name || "-",

        customerName: getCustomerDisplayName(cycle.purchaseOrder?.customer),

        poNumber: cycle.purchaseOrder?.customerPONumber || "-",

        invoiceNumber: cycle.invoiceNumber || "-",

        billedAmount,

        paymentReceived,

        pendingAmount: pendingAmount > 0 ? pendingAmount : 0,
      };
    });
}
