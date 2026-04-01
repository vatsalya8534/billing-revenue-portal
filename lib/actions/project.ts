"use server";

import { Project } from "@/types";
import { prisma } from "../prisma";
import { projectSchema } from "../validators";
import { formatError } from "../utils";
import { buildFilters } from "../filter";

export interface PLMonthlyData {
  month: string;
  revenue: number;
  cost: number;
}

export interface PLProjectData {
  projectId: string;
  projectName: string;
  totalRevenue: number;
  totalCost: number;
}

export interface PLData {
  billingCycle: {
    id: string;
    billedAmount: number;
    otherCost: number;
  }[];
  monthly: PLMonthlyData[];
  projects: PLProjectData[];
}

interface MonthlyDetailsParams {
  month: number;
  year: number;
  company?: string;
  project?: string;
  startDate?: any;
  endDate?: any;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export async function getProjects() {

  return await prisma.project.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      company: true,
      billingPlan: true
    }
  })
}

export async function createProject(data: Project) {

  try {
    const project = projectSchema.parse(data)

    let amount = getTotalAmount(data.billingCycle);

    let result = await prisma.project.create({
      data: {
        companyId: project.companyId,
        projectName: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate,
        poValue: project.poValue || "",
        resourceCount: project.resourceCount,
        billingPlanId: project.billingPlanId,
        orderType: project.orderType,
        totalRevenue: amount.totalRevenue,
        totalCost: amount.totalCost,
        status: project.status,
      }
    })

    createBillingCycle(data.billingCycle, result.id)

    return {
      success: true,
      message: "Project created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function getprojectById(id: string) {
  try {

    let project = await prisma.project.findFirst({
      where: { id },
      include: {
        company: true
      }
    })

    if (project) {
      return {
        success: true,
        data: project,
        message: "Project fetched successfully"
      }
    }

    return {
      success: false,
      message: "Project not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function updateProject(data: Project, id: string) {
  try {

    const project = projectSchema.parse(data)

    let amount = getTotalAmount(data.billingCycle);

    await prisma.project.update({
      where: { id },
      data: {
        companyId: project.companyId,
        projectName: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate,
        poValue: project.poValue,
        resourceCount: project.resourceCount,
        billingPlanId: project.billingPlanId,
        orderType: project.orderType,
        totalRevenue: amount.totalRevenue,
        totalCost: amount.totalCost,
        status: project.status,
      }
    })

    createBillingCycle(data.billingCycle, id)

    return {
      success: true,
      message: "Project updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteProject(id: any) {
  try {
    await prisma.project.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Project deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}


export async function getBillingCyclesByPOID(id: string) {
  try {

    let billingCycles = await prisma.projectMonthlyPL.findMany({
      where: {
        projectId: id
      }
    })

    if (billingCycles) {
      return {
        success: true,
        data: billingCycles,
        message: "ProjectMonthlyPL fetched successfully"
      }
    }

    return {
      success: false,
      message: "ProjectMonthlyPL not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}


async function createBillingCycle(data: any, id: string) {

  try {
    await prisma.projectMonthlyPL.deleteMany({
      where: {
        projectId: id
      }
    })

    for (const projectMonthlyPL of data) {
      await prisma.projectMonthlyPL.create({
        data: {
          projectId: id,
          month: projectMonthlyPL.month,
          year: projectMonthlyPL.year,
          billedAmount: projectMonthlyPL.billedAmount,
          fms: projectMonthlyPL.fms,
          spare: projectMonthlyPL.spare,
          otherCost: JSON.stringify(projectMonthlyPL.otherCost),
        }
      })
    }

    return {
      success: true,
      message: "Billing Cycle created successfully"
    }

  } catch (error) {

    return {
      success: false,
      message: formatError(error)
    }
  }
}

function getTotalAmount(data: any) {
  let amount = {
    totalRevenue: 0,
    totalCost: 0,
  };

  if (data) {
    for (const billingCycle of data) {
      const billed = Number(billingCycle.billedAmount) || 0;
      const fms = Number(billingCycle.fms) || 0;
      const spare = Number(billingCycle.spare) || 0;

      console.log(fms);
      console.log(spare);
      console.log(billed);


      if (billed !== 0 && (fms !== 0 || spare !== 0)) {
        amount.totalRevenue += billed;

        amount.totalCost += fms + spare;

        let otherCostData: any[] = [];

        if (typeof billingCycle.otherCost === "string") {
          try {
            otherCostData = JSON.parse(billingCycle.otherCost);
          } catch (e) {
            console.error("Invalid JSON:", billingCycle.otherCost);
          }
        } else {
          otherCostData = billingCycle.otherCost || [];
        }

        for (const otherCost of otherCostData) {
          if (
            otherCost?.key !== "FMS" &&
            otherCost?.key !== "SPARE" &&
            isFinite(otherCost?.value)
          ) {
            amount.totalCost += Number(otherCost.value);
          }
        }
      }
    }
  }

  return amount;
}

// 🔒 Always returns array (SAFE)
function parseOtherCost(otherCost: any): { key: string; value: number }[] {
  if (!otherCost) return [];

  try {
    if (Array.isArray(otherCost)) return otherCost;

    if (typeof otherCost === "string") {
      const parsed = JSON.parse(otherCost);
      return Array.isArray(parsed) ? parsed : [];
    }

    if (typeof otherCost === "object") {
      return Object.values(otherCost).map((c: any) => ({
        key: c?.key || "",
        value: Number(c?.value || 0),
      }));
    }

    return [];
  } catch (err) {
    console.error("parseOtherCost error:", err);
    return [];
  }
}

// 🔒 Single source of truth for cost calculation
function calculateCost(rec: any): number {
  const parsed = parseOtherCost(rec.otherCost);

  const otherCostTotal = parsed.reduce(
    (sum, c: any) => sum + Number(c?.value || 0),
    0
  );

  return (
    otherCostTotal +
    Number(rec.fms || 0) +
    Number(rec.spare || 0)
  );
}

// ================= MAIN =================

export async function getPLData(year: number, filters?: any): Promise<PLData> {
  console.log(filters);

  const records = await prisma.projectMonthlyPL.findMany({
    where: {
      year,
      ...(filters.project && filters.project !== "all" && {
        projectId: filters.project,
      }),

      ...(filters.company && filters.company !== "all" && {
        project: {
          is: {
            companyId: filters.company,
          },
        },
      }),

      ...(filters.startDate || filters.endDate
        ? {
          project: {
            is: {
              ...(filters.company && filters.company !== "all" && {
                companyId: filters.company,
              }),

              ...(filters.startDate && {
                startDate: {
                  gte: new Date(filters.startDate),
                },
              }),

              ...(filters.endDate && {
                endDate: {
                  lte: new Date(filters.endDate),
                },
              }),
            },
          },
        }
        : {}),
    },
    include: {
      project: {
        include: {
          company: true,
        },
      },
    },
  });


  // ================= MONTHLY =================
  const monthlyData: PLMonthlyData[] = monthNames.map((month, index) => {
    const monthRecords = records.filter((r) => {
      const monthValue = Array.isArray(r.month)
        ? Number(r.month[0])
        : Number(r.month);

      return monthValue === index;
    });

    let revenue = 0;
    let cost = 0;

    for (const rec of monthRecords) {
      revenue += Number(rec.billedAmount || 0);
      cost += calculateCost(rec);
    }

    return { month, revenue, cost };
  });

  // ================= PROJECT =================
  const projectMap: Record<string, PLProjectData> = {};

  for (const rec of records) {
    if (!projectMap[rec.projectId]) {
      projectMap[rec.projectId] = {
        projectId: rec.projectId,
        projectName: rec.project.projectName,
        totalRevenue: 0,
        totalCost: 0,
      };
    }

    projectMap[rec.projectId].totalRevenue += Number(rec.billedAmount || 0);
    projectMap[rec.projectId].totalCost += calculateCost(rec);
  }

  const projects = Object.values(projectMap);

  // ================= BILLING CYCLE =================
  const billingCycle = records.map((rec) => ({
    id: rec.id,
    billedAmount: Number(rec.billedAmount || 0),
    otherCost: calculateCost(rec),
  }));

  return {
    monthly: monthlyData,
    projects,
    billingCycle,
  };
}

// ================= STATUS =================
export async function getPLStatusData(year: number, month: number) {
  const data = await getPLData(year);

  const monthName = monthNames[month - 1];

  const monthData = data.monthly.find((m) => m.month === monthName);

  const revenue = Number(monthData?.revenue ?? 0);
  const cost = Number(monthData?.cost ?? 0);
  const profit = revenue - cost;
  const overdue = profit < 0 ? Math.abs(profit) : 0;

  return [
    { status: "Revenue", value: revenue },
    { status: "Cost", value: cost },
    { status: "Profit", value: profit > 0 ? profit : 0 },
    { status: "Overdue", value: overdue },
  ];
}

// ================= SUMMARY =================
export async function getPLSummary(year: number) {
  const data = await getPLData(year);

  let totalRevenue = 0;
  let totalCost = 0;

  data.monthly.forEach((m) => {
    totalRevenue += Number(m.revenue || 0);
    totalCost += Number(m.cost || 0);
  });

  return {
    revenue: totalRevenue,
    cost: totalCost,
    profit: totalRevenue - totalCost,
  };
}

// ================= DETAILS =================
export async function getPLStatusDetails(
  status: string,
  year: number,
  month: number
) {
  const records = await prisma.projectMonthlyPL.findMany({
    where: { year, month },
    include: {
      project: {
        include: {
          company: true,
          billingPlan: true,
        },
      },
    },
  });

  const result = records.map((rec) => {
    const revenue = Number(rec.billedAmount || 0);
    const cost = calculateCost(rec);
    const profit = revenue - cost;

    return {
      id: rec.id,
      poNumber: rec.project?.projectName || "-",
      invoiceNumber: "-",
      companyName: rec.project?.company?.name || "-",
      serviceName: rec.project?.projectName || "-",
      billingPlan: rec.project?.billingPlan?.name || "-",
      amount: profit,
      extraAmount: cost,
    };
  });

  return result.filter((item) => {
    if (status === "Revenue") return item.amount + item.extraAmount > 0;
    if (status === "Cost") return item.extraAmount > 0;
    if (status === "Profit") return item.amount > 0;
    if (status === "Overdue") return item.amount < 0;
    return true;
  });
}

function safeNumber(value: any) {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export async function fetchPLPageData(projectId: string) {
  const projectRes = await getprojectById(projectId);
  const billingRes = await getBillingCyclesByPOID(projectId);

  if (!projectRes.success || !projectRes.data) {
    return { success: false, message: "Project not found" };
  }

  const project = projectRes.data;
  const billingCycles = billingRes.success && billingRes.data ? billingRes.data : [];

  // Map billing cycles with safe numbers and calculate profit
  const billingCyclesSafe = billingCycles.map((b: any) => {
    const billedAmount = safeNumber(b.billedAmount);
    const fms = safeNumber(b.fms);
    const spare = safeNumber(b.spare);

    // Parse otherCost safely
    let otherCost = 0;
    if (b.otherCost) {
      try {
        let parsed = Array.isArray(b.otherCost)
          ? b.otherCost
          : typeof b.otherCost === "string"
            ? JSON.parse(b.otherCost)
            : [];

        if (!Array.isArray(parsed)) parsed = [];

        otherCost = parsed.reduce((sum: number, c: any) => sum + safeNumber(c.value), 0);
      } catch (err) {
        otherCost = 0;
      }
    }

    const totalCost = fms + spare + otherCost;
    const profitAmount = billedAmount - totalCost;
    const profitPercent = billedAmount === 0 ? 0 : (profitAmount / billedAmount) * 100;

    return {
      id: b.id,
      month: b.month,
      year: b.year,
      billedAmount,
      fms,
      spare,
      otherCost,
      totalCost,
      profitAmount,
      profitPercent
    };
  });

  // ================== TOTALS ==================
  const totalBilledValue = billingCyclesSafe.reduce((sum, b) => sum + b.billedAmount, 0);
  const totalCostValue = billingCyclesSafe.reduce((sum, b) => sum + b.totalCost, 0);
  const totalFMSValue = billingCyclesSafe.reduce((sum, b) => sum + b.fms, 0);
  const totalSpareValue = billingCyclesSafe.reduce((sum, b) => sum + b.spare, 0);
  const totalResourceCount = safeNumber(project.resourceCount);
  const totalPOValue = safeNumber(project.poValue);
  const totalProfit = totalBilledValue === 0 ? 0 : ((totalBilledValue - totalCostValue) / totalBilledValue) * 100;

  return {
    success: true,
    project,
    billingCycles: billingCyclesSafe,
    totals: {
      totalPOValue,
      totalBilledValue,
      totalCostValue,
      totalResourceCount,
      totalFMSValue,
      totalSpareValue,
      totalProfit
    }
  };
}


export async function filterProjectData(filters: any) {
  const where = buildFilters(filters);

  let totalPOValue = 0;
  let totalBilledValue = 0;
  let totalCostValue = 0;
  let totalFMSValue = 0;
  let totalSpareValue = 0;
  let totalResourceCount = 0;
  let totalProfit = 0;

  const projects = await prisma.project.findMany({
    where,
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (projects.length > 0) {
    for (const project of projects) {
      totalPOValue += Number(project.poValue);
      totalBilledValue += Number(project.totalRevenue);
      totalCostValue += Number(project.totalCost);
      totalResourceCount += Number(project.resourceCount);

      let billingCycle = await getBillingCyclesByPOID(project.id)

      if (billingCycle?.data && billingCycle.data.length > 0) {
        for (const cycle of billingCycle.data) {


          totalFMSValue += Number(cycle.fms);
          totalSpareValue += Number(cycle.spare)
        }
      }
    }
  }

  let profit: number = Math.round(((totalBilledValue - totalCostValue) / totalBilledValue) * 100)

  if (isNaN(profit)) { profit = 0 }

  return {
    totalPOValue: totalPOValue,
    totalBilledValue: totalBilledValue,
    totalCostValue: totalCostValue,
    totalFMSValue: totalFMSValue,
    totalSpareValue: totalSpareValue,
    totalResourceCount: totalResourceCount,
    totalProfit: profit,
    data: JSON.parse(JSON.stringify(projects))
  }
}

export async function getMonthlyRevenueCost(year: number, filters: any) {
  const data = await getPLData(year, filters);

  return {
    revenue: data.monthly.map((m) => ({
      month: m.month,
      value: Number(m.revenue || 0),
    })),
    cost: data.monthly.map((m) => ({
      month: m.month,
      value: Number(m.cost || 0),
    })),
  };
}

export async function getBillingDetailsByMonth(params: MonthlyDetailsParams, filters: any) {
  const { month, year, company, project } = params;

  const dbMonth = month - 1;

  const data = await prisma.projectMonthlyPL.findMany({
    where: {
      month: dbMonth,
      year,

      ...(project && project !== "all" && {
        projectId: project,
      }),

      ...(company && company !== "all" && {
        project: {
          is: {
            companyId: company,
          },
        },
      }),
      ...(filters.startDate || filters.endDate
        ? {
          project: {
            is: {
              ...(filters.company && filters.company !== "all" && {
                companyId: filters.company,
              }),

              ...(filters.startDate && {
                startDate: {
                  gte: new Date(filters.startDate),
                },
              }),

              ...(filters.endDate && {
                endDate: {
                  lte: new Date(filters.endDate),
                },
              }),
            },
          },
        }
        : {}),
    },

    include: {
      project: {
        include: {
          company: true,
        },
      },
    },
  });

  return data.map((item) => ({
    month,
    year,
    companyName: item.project.company.name,
    projectName: item.project.projectName,
    billed: Number(item.billedAmount || 0),
  }));
}

// ✅ Cost Details
export async function getCostDetailsByMonth(params: MonthlyDetailsParams, filters: any) {

  const { month, year, company, project } = params;


  const dbMonth = month - 1;

  const data = await prisma.projectMonthlyPL.findMany({
    where: {
      month: dbMonth,
      year,

      ...(project && project !== "all" && {
        projectId: project,
      }),

      ...(company && company !== "all" && {
        project: {
          is: {
            companyId: company,
          },
        },
      }),

      ...(filters.startDate || filters.endDate
        ? {
          project: {
            is: {
              ...(filters.company && filters.company !== "all" && {
                companyId: filters.company,
              }),

              ...(filters.startDate && {
                startDate: {
                  gte: new Date(filters.startDate),
                },
              }),

              ...(filters.endDate && {
                endDate: {
                  lte: new Date(filters.endDate),
                },
              }),
            },
          },
        }
        : {}),
    },

    include: {
      project: {
        include: {
          company: true,
        },
      },
    },
  });

  return JSON.parse(JSON.stringify(data.map((item) => ({
    month,
    year,
    billedAmount: item.billedAmount,
    companyName: item.project.company.name,
    projectName: item.project.projectName,
    fms: Number(item.fms || 0),
    spare: Number(item.spare || 0),
    other: item.otherCost || {},
  }))));
}