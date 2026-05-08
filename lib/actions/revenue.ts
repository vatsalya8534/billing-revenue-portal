"use server";

import { getFinancialYearRange } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

function getCurrentFinancialYear() {
  const now = new Date();

  return now.getMonth() < 3
    ? now.getFullYear() - 1
    : now.getFullYear();
}

function getInvoiceDate(cycle: {
  invoiceDate?: Date | null;
  billingSubmittedDate?: Date | null;
  paymentDueDate?: Date | null;
}) {
  return (
    cycle.invoiceDate ??
    cycle.billingSubmittedDate ??
    cycle.paymentDueDate ??
    null
  );
}

// ================= REVENUE SUMMARY =================
export async function getRevenueSummary(
  year = getCurrentFinancialYear(),
) {
  const { start, end } = getFinancialYearRange(year);

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
      ],
    },
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      invoiceDate: true,
      billingSubmittedDate: true,
      paymentDueDate: true,
    },
  });

  const today = new Date();
  let billed = 0, collected = 0, overdue = 0;

  cycles.forEach(c => {
    const invoiceDate = getInvoiceDate(c);
    if (!invoiceDate || invoiceDate < start || invoiceDate > end) {
      return;
    }

    const inv = Number(c.invoiceAmount ?? 0);
    const col = Number(c.collectedAmount ?? 0);
    billed += inv;
    collected += col;

    if (c.paymentDueDate && col < inv) {
      const due = new Date(c.paymentDueDate);
      due.setHours(0, 0, 0, 0);
      if (due < today) overdue += inv - col;
    }
  });

  return { billed, collected, overdue, outstanding: billed - collected, efficiency: billed ? (collected / billed) * 100 : 0 };
}

// ================= REVENUE BY COMPANY =================
export async function getRevenueByCompany(
  year = getCurrentFinancialYear(),
) {
  const { start, end } = getFinancialYearRange(year);

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
      ],
    },
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      invoiceDate: true,
      billingSubmittedDate: true,
      paymentDueDate: true,
      purchaseOrder: {
        select: {
          customer: {
            select: {
              companyName: true,
            },
          },
        },
      },
    },
  });

  const map = new Map<string, { billed: number; collected: number }>();

  cycles.forEach((c) => {
    const invoiceDate = getInvoiceDate(c);
    if (!invoiceDate || invoiceDate < start || invoiceDate > end) {
      return;
    }

    const name = c.purchaseOrder?.customer?.companyName || "Unknown";

    if (!map.has(name)) {
      map.set(name, { billed: 0, collected: 0 });
    }

    const entry = map.get(name)!;

    entry.billed += Number(c.invoiceAmount || 0);
    entry.collected += Number(c.collectedAmount || 0);
  });

  return Array.from(map.entries()).map(([companyName, rev]) => ({
    companyName,
    billed: rev.billed,
    collected: rev.collected,
    overdue: rev.billed - rev.collected,
  }));
}

// ================= REVENUE BY CUSTOMER =================
export async function getRevenueByCustomer(
  year = getCurrentFinancialYear(),
) {
  const { start, end } = getFinancialYearRange(year);

  const data = await prisma.billingCycle.findMany({
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
      ],
    },
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      invoiceDate: true,
      billingSubmittedDate: true,
      paymentDueDate: true,
      purchaseOrder: {
        select: { customerId: true },
      },
    },
  });

  const map = new Map<string, { billed: number; collected: number }>();
  data.forEach(item => {
    const invoiceDate = getInvoiceDate(item);
    if (!invoiceDate || invoiceDate < start || invoiceDate > end) {
      return;
    }

    const cid = item.purchaseOrder?.customerId;
    if (!cid) return;

    if (!map.has(cid)) map.set(cid, { billed: 0, collected: 0 });
    const existing = map.get(cid)!;
    existing.billed += Number(item.invoiceAmount ?? 0);
    existing.collected += Number(item.collectedAmount ?? 0);
  });

  return Array.from(map.entries()).map(([customerId, rev]) => ({
    customerId,
    billed: rev.billed,
    collected: rev.collected,
    overdue: rev.billed - rev.collected,
  }));
}

// ================= UPCOMING PAYMENTS =================
export async function getUpcomingPayments() {
  const today = new Date();
  return prisma.billingCycle.findMany({
    where: { paymentDueDate: { gt: today } },
    select: { invoiceNumber: true, paymentDueDate: true, invoiceAmount: true },
    orderBy: { paymentDueDate: "asc" },
  });
}
