"use server";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

// ---------------- DASHBOARD STATS ----------------
export async function getDashboardStats() {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const billCount = await prisma.billingCycle.count();

  const billingThisMonthAgg = await prisma.billingCycle.aggregate({
    where: {
      paymentReceived: "YES",
      paymentReceivedDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      collectedAmount: true, // ✅ FIXED
    },
  });

  const totalBilledAgg = await prisma.purchaseOrder.aggregate({
    _sum: {
      poAmount: true,
    },
  });

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return {
    billCount,
    billingThisMonth: billingThisMonthAgg._sum.collectedAmount || 0, // ✅ FIXED
    totalBilledAmount: totalBilledAgg._sum.poAmount || 0,
    currentMonth: months[now.getMonth()],
  };
}

// ---------------- PIE CHART ----------------
export async function getBillingStatusData(year: number) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  const today = new Date();

  const cycles = await prisma.billingCycle.findMany({
    where: {
      billingSubmittedDate: { gte: startOfYear, lte: endOfYear }, // ✅ FIXED
    },
    select: {
      invoiceAmount: true,
      collectedAmount: true,
      paymentReceived: true,
      billingSubmittedDate: true,
    },
  });

  let billGenerated = 0;
  let paymentReceived = 0;
  let overdue = 0;

  cycles.forEach((cycle) => {
    const billingAmt = Number(cycle.invoiceAmount || 0);
    const paidAmt = Number(cycle.collectedAmount || 0);

    billGenerated += billingAmt;

    if (cycle.paymentReceived === "YES") {
      paymentReceived += paidAmt;
    }

    if (
      cycle.billingSubmittedDate &&
      paidAmt < billingAmt &&
      new Date(cycle.billingSubmittedDate) <= today
    ) {
      overdue += billingAmt - paidAmt;
    }
  });

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

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
export async function getBillingStatusDetails(status: string, year: number) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  const today = new Date();

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    include: {
      customer: true,
      ServiceType: true,
      billingPlan: true,
      billingCycles: true,
    },
  });

  return purchaseOrders
    .map((po) => {
      const relevantCycles = po.billingCycles.filter((cycle) => {
        const billingDate = cycle.billingSubmittedDate;
        if (!billingDate) return false;

        if (status === "Bill Generated") {
          return billingDate >= startOfYear && billingDate <= endOfYear;
        }

        if (status === "Payment Received") {
          return (
            cycle.paymentReceived === "YES" &&
            billingDate >= startOfYear &&
            billingDate <= endOfYear
          );
        }

        if (status === "Overdue") {
          const billingAmt = Number(cycle.invoiceAmount || 0);
          const paidAmt = Number(cycle.collectedAmount || 0);
          return billingDate <= today && paidAmt < billingAmt;
        }

        return false;
      });

      if (!relevantCycles.length) return null;

      let extraAmount = 0;

      if (status === "Payment Received") {
        extraAmount = relevantCycles.reduce(
          (sum, c) => sum + Number(c.collectedAmount || 0),
          0
        );
      }

      if (status === "Overdue") {
        extraAmount = relevantCycles.reduce(
          (sum, c) =>
            sum +
            (Number(c.invoiceAmount || 0) -
              Number(c.collectedAmount || 0)),
          0
        );
      }

      return {
        id: po.id,
        poNumber: po.customerPONumber,
        customerName: `${po.customer?.firstName || ""} ${po.customer?.lastName || ""}`,
        serviceName: po.ServiceType?.name || "-",
        billingPlan: po.billingPlan?.name || "-",
        amount: po.poAmount,
        startDate: po.startFrom ? format(new Date(po.startFrom), "dd/MM/yyyy") : "-",
        endDate: po.endDate ? format(new Date(po.endDate), "dd/MM/yyyy") : "-",
        status: po.status,
        extraAmount,
      };
    })
    .filter(Boolean);
}