import { BillingCycleType } from "@prisma/client";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getMonthSpan(startDate: Date, endDate?: Date | null) {
  if (!endDate) return 1;

  const start = getMonthStart(startDate);
  const end = getMonthStart(endDate);
  const diff =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;

  return Math.max(1, diff);
}

export function getBillingCycleOffsets(
  startDate: Date,
  totalCycles: number,
  endDate?: Date | null,
) {
  const totalMonths = getMonthSpan(startDate, endDate);
  const safeTotalCycles = Math.min(Math.max(1, totalCycles), totalMonths);

  return Array.from({ length: safeTotalCycles }, (_, index) =>
    Math.min(
      totalMonths - 1,
      Math.floor((index * totalMonths) / safeTotalCycles),
    ),
  );
}

export function getBillingCycleDate(
  baseDate: Date,
  type: BillingCycleType | "START" | "MID" | "END",
) {
  const date = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    1,
  );

  if (type === "MID") {
    date.setDate(15);
    return date;
  }

  if (type === "END") {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  return date;
}

export function getPurchaseOrderCycleDates(
  baseDate: Date,
  type: BillingCycleType | "START" | "MID" | "END",
) {
  const monthStart = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    1,
  );

  if (type === "MID") {
    const midDate = new Date(monthStart);
    midDate.setDate(15);

    return {
      invoiceDate: midDate,
      billingSubmittedDate: undefined,
    };
  }

  if (type === "END") {
    return {
      invoiceDate: new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0,
      ),
      billingSubmittedDate: undefined,
    };
  }

  return {
    invoiceDate: monthStart,
    billingSubmittedDate: undefined,
  };
}

export function generatePurchaseOrderBillingCycles({
  startDate,
  endDate,
  intervalMonths,
  type,
}: {
  startDate: Date;
  endDate?: Date | null;
  intervalMonths: number;
  type: BillingCycleType | "START" | "MID" | "END";
}) {
  const totalMonths = getMonthSpan(startDate, endDate);
  const safeIntervalMonths = Math.max(1, Math.floor(intervalMonths || 1));
  const cycles = [];

  for (let offset = 0; offset < totalMonths; offset += safeIntervalMonths) {
    const baseDate = addMonths(startDate, offset);
    cycles.push(getPurchaseOrderCycleDates(baseDate, type));
  }

  return cycles;
}

export function generateProjectBillingCycles({
  startDate,
  endDate,
  totalCycles,
  amountPerCycle,
}: {
  startDate: Date;
  endDate?: Date | null;
  totalCycles: number;
  amountPerCycle: number;
}) {
  return getBillingCycleOffsets(startDate, totalCycles, endDate).map(
    (offset) => {
      const cycleDate = addMonths(startDate, offset);

      return {
        month: cycleDate.getMonth(),
        year: cycleDate.getFullYear(),
        billedAmount: 0,
        fms: 0,
        spare: 0,
        billableAmount: amountPerCycle,
        resourceUsed: 0,
        otherCost: [],
      };
    },
  );
}

export function formatBillingCycleLabel(
  date?: Date | string | null,
  fallbackMonth?: number,
  fallbackYear?: number,
) {
  if (date) {
    const value = new Date(date);

    if (!Number.isNaN(value.getTime())) {
      return `${MONTH_NAMES[value.getMonth()]} ${value.getFullYear()}`;
    }
  }

  if (
    typeof fallbackMonth === "number" &&
    fallbackMonth >= 0 &&
    fallbackMonth <= 11 &&
    typeof fallbackYear === "number"
  ) {
    return `${MONTH_NAMES[fallbackMonth]} ${fallbackYear}`;
  }

  return "Billing Cycle";
}
