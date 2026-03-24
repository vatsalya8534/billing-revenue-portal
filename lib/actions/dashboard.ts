"use server";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// ---------------- DASHBOARD STATS ----------------
export async function getDashboardStats() {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const billCount = await prisma.billingCycle.count();

  const billingThisMonthAgg = await prisma.billingCycle.aggregate({
    where: {
      billingSubmittedDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      invoiceAmount: true,
    },
  });

  const totalBilledAgg = await prisma.purchaseOrder.aggregate({
    _sum: {
      poAmount: true,
    },
  });

  // ✅ TOTAL OVERDUE CALCULATION
  const overdueCycles = await prisma.billingCycle.findMany({
    where: {
      paymentDueDate: {
        not: null,
      },
    },
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      paymentDueDate: true,
    },
  });

  let totalOverdue = 0;

  overdueCycles.forEach((cycle) => {
    const billingAmt = Number(cycle.invoiceAmount || 0);
    const paidAmt = Number(cycle.collectedAmount || 0);

    if (!cycle.paymentDueDate) return;

    const dueDate = new Date(cycle.paymentDueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today && paidAmt < billingAmt) {
      totalOverdue += billingAmt - paidAmt;
    }
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return {
    billCount,
    billingThisMonth: billingThisMonthAgg._sum.invoiceAmount || 0,
    totalBilledAmount: totalBilledAgg._sum.poAmount || 0,
    totalOverdueAmount: totalOverdue, // ✅ NEW FIELD
    currentMonth: months[now.getMonth()],
  };
}

// ---------------- PIE CHART ----------------
export async function getBillingStatusData(year: number, month?: number) {
  const start = new Date(year, (month || 1) - 1, 1);
  const end = month
    ? new Date(year, month, 0, 23, 59, 59)
    : new Date(year, 11, 31, 23, 59, 59);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycles = await prisma.billingCycle.findMany({
    where: {
      OR: [
        { billingSubmittedDate: { gte: start, lte: end } },
        { paymentDueDate: { gte: start, lte: end } },
      ],
    },
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      paymentReceived: true,
      billingSubmittedDate: true,
      paymentDueDate: true,
    },
  });

  let billGenerated = 0;
  let paymentReceived = 0;
  let overdue = 0;

  for (const cycle of cycles) {
    const billingAmt = Number(cycle.invoiceAmount || 0);
    const paidAmt = Number(cycle.collectedAmount || 0);

    const billingDate = cycle.billingSubmittedDate;
    const dueDateRaw = cycle.paymentDueDate;

    if (billingDate && billingDate >= start && billingDate <= end) {
      billGenerated += billingAmt;

      if (cycle.paymentReceived === "YES") {
        paymentReceived += paidAmt;
      }
    }

    if (dueDateRaw && paidAmt < billingAmt) {
      const dueDate = new Date(dueDateRaw);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today && dueDate >= start && dueDate <= end) {
        overdue += billingAmt - paidAmt;
      }
    }
  }

  return [
    { status: "Bill Generated", value: billGenerated },
    { status: "Payment Received", value: paymentReceived },
    { status: "Overdue", value: overdue },
  ];
}

// ---------------- MONTHLY CHART ----------------
export async function getMonthlyBillingData(year: number) {
  const now = new Date();
  const currentMonthIndex = now.getMonth();

  const cycles = await prisma.billingCycle.findMany({
    where: {
      billingSubmittedDate: {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31),
      },
    },
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      paymentReceived: true,
      billingSubmittedDate: true,
    },
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const monthlyData = months.map((month, index) => ({
    month,
    billing: 0,
    payment: 0,
    index,
  }));

  cycles.forEach((cycle) => {
    if (!cycle.billingSubmittedDate) return;

    const monthIndex = new Date(cycle.billingSubmittedDate).getMonth();

    monthlyData[monthIndex].billing += Number(cycle.invoiceAmount || 0);

    if (cycle.paymentReceived === "YES") {
      monthlyData[monthIndex].payment += Number(cycle.collectedAmount || 0);
    }
  });

  if (year === now.getFullYear()) {
    monthlyData.forEach((m) => {
      if (m.index > currentMonthIndex) {
        m.billing = 0;
        m.payment = 0;
      }
    });
  }

  return monthlyData;
}

// ---------------- TABLE DETAILS ----------------
export async function getBillingStatusDetails(
  status: string,
  year: number,
  month?: number
) {
  const start = new Date(year, (month || 1) - 1, 1);
  const end = month
    ? new Date(year, month, 0, 23, 59, 59)
    : new Date(year, 11, 31, 23, 59, 59);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycles = await prisma.billingCycle.findMany({
    where: {
      OR: [
        { billingSubmittedDate: { gte: start, lte: end } },
        { paymentDueDate: { gte: start, lte: end } },
      ],
    },
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
      const billingAmt = Number(cycle.invoiceAmount || 0);
      const paidAmt = Number(cycle.collectedAmount || 0);

      const billingDate = cycle.billingSubmittedDate;
      const dueDateRaw = cycle.paymentDueDate;

      if (status === "Bill Generated") {
        return billingDate && billingDate >= start && billingDate <= end;
      }

      if (status === "Payment Received") {
        return (
          cycle.paymentReceived === "YES" &&
          billingDate &&
          billingDate >= start &&
          billingDate <= end
        );
      }

      if (status === "Overdue") {
        if (!dueDateRaw) return false;

        const dueDate = new Date(dueDateRaw);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate < today && paidAmt < billingAmt;
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
            ? Number(cycle.invoiceAmount || 0) -
            Number(cycle.collectedAmount || 0)
            : 0,
    }));
}