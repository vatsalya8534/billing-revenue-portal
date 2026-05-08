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

type CycleCustomer = {
  companyName?: string | null;
  customerCode?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

type CycleCompany = {
  id?: string | null;
  name?: string | null;
};

type CyclePurchaseOrder = {
  company?: CycleCompany | null;
  customer?: CycleCustomer | null;
  customerPONumber?: string | null;
  ServiceType?: {
    name?: string | null;
  } | null;
  billingPlan?: {
    name?: string | null;
  } | null;
  startFrom?: Date | null;
  endDate?: Date | null;
  status?: string | null;
};

type BillingCycleLike = {
  id?: string;
  invoiceNumber?: string | null;
  billingSubmittedDate?: Date | null;
  collectedAmount?: number | null;
  invoiceAmount?: number | null;
  invoiceDate?: Date | null;
  paymentDueDate?: Date | null;
  paymentReceived?: PaymentReceived | null;
  paymentReceivedDate?: Date | null;
  purchaseOrder?: CyclePurchaseOrder | null;
};

function normalizeDate(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getCurrentFinancialYear(date = new Date()) {
  return date.getMonth() < 3
    ? date.getFullYear() - 1
    : date.getFullYear();
}

function getFinancialYearRange(year: number) {
  const start = new Date(year, 3, 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(
    year + 1,
    2,
    31,
    23,
    59,
    59,
    999,
  );

  return { start, end };
}

function getFinancialMonth(date: Date) {
  return (date.getMonth() + 9) % 12;
}

function getFinancialMonthRange(
  financialYear: number,
  monthIndex: number,
) {
  const calendarMonth =
    monthIndex <= 8 ? monthIndex + 3 : monthIndex - 9;

  const calendarYear =
    monthIndex <= 8
      ? financialYear
      : financialYear + 1;

  const start = new Date(
    calendarYear,
    calendarMonth,
    1,
  );

  start.setHours(0, 0, 0, 0);

  const end = new Date(
    calendarYear,
    calendarMonth + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return {
    start,
    end,
    calendarMonth,
    calendarYear,
  };
}

function getInvoiceDate(
  cycle: BillingCycleLike,
): Date | null {
  return (
    cycle.invoiceDate ??
    cycle.billingSubmittedDate ??
    null
  );
}

function getPaymentDate(
  cycle: BillingCycleLike,
): Date | null {
  return cycle.paymentReceivedDate ?? null;
}

function getSeriesDate(
  cycle: BillingCycleLike,
  series: RevenueSeries,
) {
  return series === "payment"
    ? getPaymentDate(cycle)
    : getInvoiceDate(cycle);
}

function getEffectiveCollectedAmount(
  cycle: BillingCycleLike,
) {
  return Number(cycle.collectedAmount || 0);
}

function normalizeAmounts(
  billed: number,
  collected: number,
) {
  const safeCollected = Math.min(
    collected,
    billed,
  );

  return {
    billed,
    collected: safeCollected,
    pending: Math.max(
      billed - safeCollected,
      0,
    ),
  };
}

function matchesCompanyFilter(
  cycle: BillingCycleLike,
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

function matchesFilterMonth(
  date: Date,
  filters?: BillingStatusFilters,
) {
  if (!filters?.month || filters.month === "all") {
    return true;
  }

  return (
    getFinancialMonth(date) === Number(filters.month)
  );
}

function isWithinFilterDateRange(
  date: Date,
  filters?: BillingStatusFilters,
) {
  if (filters?.startDate) {
    const startDate = normalizeDate(
      new Date(filters.startDate),
    );

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

function getCustomerDisplayName(
  customer?: CycleCustomer | null,
) {
  if (!customer) return "-";

  if (customer.companyName?.trim()) {
    return customer.companyName;
  }

  const fullName = [
    customer.firstName,
    customer.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || customer.customerCode || "-";
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const currentFY = getCurrentFinancialYear();

  const { start, end } =
    getFinancialYearRange(currentFY);

  const currentMonth =
    getFinancialMonth(new Date());

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

    const normalizedDate =
      normalizeDate(invoiceDate);

    if (
      normalizedDate < start ||
      normalizedDate > end
    ) {
      continue;
    }

    const billed = Number(
      cycle.invoiceAmount || 0,
    );

    const collected =
      getEffectiveCollectedAmount(cycle);

    const { pending } = normalizeAmounts(
      billed,
      collected,
    );

    totalBilledAmount += billed;
    totalCollectedAmount += collected;

    billCount++;

    if (
      getFinancialMonth(normalizedDate) ===
      currentMonth
    ) {
      billingThisMonth += billed;
      collectedThisMonth += collected;
    }

    if (
      cycle.paymentDueDate &&
      pending > 0
    ) {
      const dueDate = normalizeDate(
        cycle.paymentDueDate,
      );

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
        ? Number(
            (
              (collectedThisMonth /
                billingThisMonth) *
              100
            ).toFixed(2),
          )
        : 0,
    currentMonth: format(new Date(), "MMM"),
  };
}

export async function getMonthlyBillingData(
  year: number,
  filters?: BillingStatusFilters,
) {
  const { start, end } =
    getFinancialYearRange(year);

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
    const billed = Number(
      cycle.invoiceAmount || 0,
    );

    const collected =
      getEffectiveCollectedAmount(cycle);

    // BILLING
    const invoiceDate = getInvoiceDate(cycle);

    if (invoiceDate) {
      const normalizedInvoiceDate =
        normalizeDate(invoiceDate);

      if (
        normalizedInvoiceDate >= start &&
        normalizedInvoiceDate <= end &&
        isWithinFilterDateRange(
          normalizedInvoiceDate,
          filters,
        ) &&
        matchesFilterMonth(
          normalizedInvoiceDate,
          filters,
        )
      ) {
        const fyMonth =
          getFinancialMonth(
            normalizedInvoiceDate,
          );

        data[fyMonth].billing += billed;

        if (
          cycle.paymentDueDate &&
          billed > collected
        ) {
          const dueDate = normalizeDate(
            cycle.paymentDueDate,
          );

          if (
            dueDate < normalizeDate(new Date())
          ) {
            data[fyMonth].overdue +=
              billed - collected;
          }
        }
      }
    }

    // PAYMENT
    const paymentDate = getPaymentDate(cycle);

    if (
      paymentDate &&
      collected > 0
    ) {
      const normalizedPaymentDate =
        normalizeDate(paymentDate);

      if (
        normalizedPaymentDate >= start &&
        normalizedPaymentDate <= end &&
        isWithinFilterDateRange(
          normalizedPaymentDate,
          filters,
        ) &&
        matchesFilterMonth(
          normalizedPaymentDate,
          filters,
        )
      ) {
        const fyMonth =
          getFinancialMonth(
            normalizedPaymentDate,
          );

        data[fyMonth].payment += collected;
      }
    }
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
      const invoiceDate =
        getInvoiceDate(cycle);

      if (!invoiceDate) {
        return false;
      }

      const normalizedDate =
        normalizeDate(invoiceDate);

      if (typeof year === "number") {
        const fyRange =
          getFinancialYearRange(year);

        if (
          normalizedDate < fyRange.start ||
          normalizedDate > fyRange.end
        ) {
          return false;
        }
      }

      if (
        !matchesCompanyFilter(
          cycle,
          filters,
        )
      ) {
        return false;
      }

      if (
        !isWithinFilterDateRange(
          normalizedDate,
          filters,
        )
      ) {
        return false;
      }

      if (
        !matchesFilterMonth(
          normalizedDate,
          filters,
        )
      ) {
        return false;
      }

      return true;
    })
    .map((cycle) => {
      const billed = Number(
        cycle.invoiceAmount || 0,
      );

      const collected =
        getEffectiveCollectedAmount(cycle);

      const pending = Math.max(
        billed - collected,
        0,
      );

      const orderStart =
        cycle.purchaseOrder?.startFrom;

      const orderEnd =
        cycle.purchaseOrder?.endDate;

      let contractDuration = "-";

      if (orderStart && orderEnd) {
        const months =
          (orderEnd.getFullYear() -
            orderStart.getFullYear()) *
            12 +
          (orderEnd.getMonth() -
            orderStart.getMonth());

        contractDuration = `${
          months + 1
        } months`;
      }

      return {
        id: cycle.id,

        customerName:
          getCustomerDisplayName(
            cycle.purchaseOrder?.customer,
          ),

        companyId:
          cycle.purchaseOrder?.company?.id ||
          null,

        companyName:
          cycle.purchaseOrder?.company?.name ||
          "-",

        poNumber:
          cycle.purchaseOrder
            ?.customerPONumber || "-",

        invoiceNumber:
          cycle.invoiceNumber || "-",

        amount: billed,

        collectedAmount: collected,

        overdueAmount: pending,

        serviceType:
          cycle.purchaseOrder?.ServiceType
            ?.name || "-",

        billingPlan:
          cycle.purchaseOrder?.billingPlan
            ?.name || "-",

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
  const { start, end } =
    getFinancialMonthRange(
      params.year,
      params.month,
    );

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
      if (
        !matchesCompanyFilter(
          cycle,
          filters,
        )
      ) {
        return false;
      }

      const seriesDate = getSeriesDate(
        cycle,
        params.series,
      );

      if (!seriesDate) {
        return false;
      }

      const normalizedDate =
        normalizeDate(seriesDate);

      if (
        normalizedDate < start ||
        normalizedDate > end
      ) {
        return false;
      }

      if (
        !isWithinFilterDateRange(
          normalizedDate,
          filters,
        )
      ) {
        return false;
      }

      if (
        params.series === "payment" &&
        getEffectiveCollectedAmount(cycle) <= 0
      ) {
        return false;
      }

      return true;
    })
    .map((cycle) => {
      const billedAmount = Number(
        cycle.invoiceAmount || 0,
      );

      const paymentReceived =
        getEffectiveCollectedAmount(cycle);

      const { pending } = normalizeAmounts(
        billedAmount,
        paymentReceived,
      );

      const seriesDate =
        getSeriesDate(
          cycle,
          params.series,
        ) || start;

      return {
        id: cycle.id || "",

        month: format(seriesDate, "MMM"),

        year: seriesDate.getFullYear(),

        customerName:
          getCustomerDisplayName(
            cycle.purchaseOrder?.customer,
          ),

        companyName:
          cycle.purchaseOrder?.company?.name ||
          "-",

        poNumber:
          cycle.purchaseOrder
            ?.customerPONumber || "-",

        invoiceNumber:
          cycle.invoiceNumber || "-",

        billedAmount,

        paymentReceived,

        pendingAmount: pending,
      };
    })
    .sort((a, b) => {
      return (
        a.companyName.localeCompare(
          b.companyName,
        ) ||
        a.customerName.localeCompare(
          b.customerName,
        ) ||
        a.poNumber.localeCompare(
          b.poNumber,
        )
      );
    });
}