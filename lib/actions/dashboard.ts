"use server";

import { prisma } from "@/lib/prisma";

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

export async function getBillingStatusData(year: number) {
  const startDate = new Date(year, 0, 1); 
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999); 
  const today = new Date();

  const cycles = await prisma.billingCycle.findMany({
    where: {
      billingDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      billingAmount: true,
      paymentReceived: true,
      paymentReceivedAmount: true,
      billingDate: true,
    },
  });

  let billGeneratedAmount = 0;
  let paymentReceivedAmount = 0;
  let overdueAmount = 0;

  cycles.forEach((cycle) => {
    const billingAmount = Number(cycle.billingAmount) || 0;
    const receivedAmount = Number(cycle.paymentReceivedAmount) || 0;

    if (cycle.billingDate && cycle.billingDate >= startDate && cycle.billingDate <= endDate) {

      billGeneratedAmount += billingAmount;

      if (cycle.paymentReceived === "YES") {
        paymentReceivedAmount += receivedAmount;
      }

      if (receivedAmount < billingAmount && new Date(cycle.billingDate) < today) {
        overdueAmount += billingAmount - receivedAmount;
      }
    }
  });

  return [
    { status: "Bill Generated", value: billGeneratedAmount },
    { status: "Payment Received", value: paymentReceivedAmount },
    { status: "Overdue", value: overdueAmount },
  ];
}