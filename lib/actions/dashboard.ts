"use server";

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function getDashboardStats() {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  const billCount = await prisma.billingCycle.count();

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const billingThisMonthAgg = await prisma.billingCycle.aggregate({
    where: {
      paymentReceived: "YES",
      paymentReceivedDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      paymentReceivedAmount: true,
    },
  });


  const totalBilledAgg = await prisma.purchaseOrder.aggregate({
    _sum: {
      poAmount: true,
    },
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return {
    billCount,
    billingThisMonth: billingThisMonthAgg._sum.paymentReceivedAmount || 0,
    totalBilledAmount: totalBilledAgg._sum.poAmount || 0,
    currentMonth: months[now.getMonth()],
  };
}

export async function getBillingStatusData(year: number) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);
  const today = new Date();

  // Fetch all billing cycles within the year
  const cycles = await prisma.billingCycle.findMany({
    where: {
      billingDate: { gte: startOfYear, lte: endOfYear },
    },
    select: {
      billingAmount: true,
      paymentReceivedAmount: true,
      paymentReceived: true,
      billingDate: true,
    },
  });

  let billGenerated = 0;
  let paymentReceived = 0;
  let overdue = 0;

  cycles.forEach((cycle) => {
    const billingAmt = Number(cycle.billingAmount || 0);
    const paidAmt = Number(cycle.paymentReceivedAmount || 0);

    // Total amount billed (Bill Generated)
    billGenerated += billingAmt;

    // Total amount received (Payment Received)
    if (cycle.paymentReceived === "YES") paymentReceived += paidAmt;

    // Total overdue amount (Billing date passed and not fully paid)
    if (cycle.billingDate && paidAmt < billingAmt && new Date(cycle.billingDate) <= today) {
      overdue += billingAmt - paidAmt;
    }
  });

  return [
    { status: "Bill Generated", value: billGenerated },
    { status: "Payment Received", value: paymentReceived },
    { status: "Overdue", value: overdue },
  ];
}

export async function getMonthlyBillingData(year: number) {
  const now = new Date();
  const currentMonthIndex = now.getMonth(); // 0 = Jan

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const cycles = await prisma.billingCycle.findMany({
    where: {
      billingDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      billingAmount: true,
      paymentReceivedAmount: true,
      paymentReceived: true,
      billingDate: true,
    },
  });

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const monthlyData = months.map((month, index) => ({
    month,
    billing: 0,
    payment: 0,
    index, 
  }));

  cycles.forEach((cycle) => {
    if (!cycle.billingDate) return;

    const monthIndex = new Date(cycle.billingDate).getMonth();

    monthlyData[monthIndex].billing += Number(cycle.billingAmount) || 0;

    if (cycle.paymentReceived === "YES") {
      monthlyData[monthIndex].payment += Number(cycle.paymentReceivedAmount) || 0;
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

export async function getBillingStatusDetails(status: string, year: number) {
  try {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    const today = new Date();

    // Fetch all POs with related billing cycles
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        customer: true,
        ServiceType: true,
        billingPlan: true,
        contractDuration: true,
        contract: true,
        billingCycles: true,
      },
    });

    // Filter POs based on the selected status
    const filteredPOs = purchaseOrders.filter((po) => {
      const cycles = po.billingCycles.filter((cycle) => {
        const billingDate = cycle.billingDate ? new Date(cycle.billingDate) : null;
        if (!billingDate) return false;

        if (status === "Bill Generated") {
          return billingDate >= startOfYear && billingDate <= endOfYear;
        }

        if (status === "Payment Received") {
          return cycle.paymentReceived === "YES" && billingDate >= startOfYear && billingDate <= endOfYear;
        }

        if (status === "Overdue") {
          const billingAmount = Number(cycle.billingAmount || 0);
          const paidAmount = Number(cycle.paymentReceivedAmount || 0);
          return billingDate <= today && paidAmount < billingAmount;
        }

        return false;
      });

      return cycles.length > 0;
    });

    return filteredPOs.map((po) => {
      const relevantCycles = po.billingCycles.filter((cycle) => {
        const billingDate = cycle.billingDate ? new Date(cycle.billingDate) : null;
        if (!billingDate) return false;

        if (status === "Bill Generated") return billingDate >= startOfYear && billingDate <= endOfYear;
        if (status === "Payment Received") return cycle.paymentReceived === "YES" && billingDate >= startOfYear && billingDate <= endOfYear;
        if (status === "Overdue") {
          const billingAmount = Number(cycle.billingAmount || 0);
          const paidAmount = Number(cycle.paymentReceivedAmount || 0);
          return billingDate <= today && paidAmount < billingAmount;
        }

        return false;
      });

      // Add extraAmount only for Payment Received and Overdue
      let extraAmount = 0;
      if (status === "Payment Received") {
        extraAmount = relevantCycles.reduce((sum, c) => sum + Number(c.paymentReceivedAmount || 0), 0);
      } else if (status === "Overdue") {
        extraAmount = relevantCycles.reduce(
          (sum, c) => sum + (Number(c.billingAmount || 0) - Number(c.paymentReceivedAmount || 0)),
          0
        );
      }

      return {
        id: po.id,
        poNumber: po.customerPONumber,
        customerName: `${po.customer?.firstName || "-"} ${po.customer?.lastName || "-"}`,
        serviceName: po.ServiceType?.name || "-",
        billingPlan: po.billingPlan?.name || "-",
        amount: po.poAmount,
        startDate: po.startFrom ? format(new Date(po.startFrom), "dd/MM/yyyy") : "-",
        endDate: po.endDate ? format(new Date(po.endDate), "dd/MM/yyyy") : "-",
        status: po.status,
        extraAmount, // <-- Added extra field here
      };
    });
  } catch (error) {
    console.error("Failed to fetch billing status details:", error);
    return [];
  }
}