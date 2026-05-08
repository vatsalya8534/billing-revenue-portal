import { Prisma } from "@prisma/client";

type Filters = {
  company?: string;
  project?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  month?: string;
  year?: string;
};

function getCalendarMonthFromFinancialMonth(
  month: number,
) {
  return month <= 8 ? month + 3 : month - 9;
}

export function buildMonthlyPLFilters(
  filters: Pick<Filters, "month" | "year">
): Prisma.ProjectMonthlyPLWhereInput {
  const where: Prisma.ProjectMonthlyPLWhereInput = {};

  if (
    (!filters.year || filters.year === "all") &&
    (!filters.month || filters.month === "all")
  ) {
    return where;
  }

  const andConditions: Prisma.ProjectMonthlyPLWhereInput[] = [];

  if (filters.year && filters.year !== "all") {
    const year = Number(filters.year);

    andConditions.push({
      OR: [
        {
          year,
          month: { gte: 3, lte: 11 },
        },
        {
          year: year + 1,
          month: { gte: 0, lte: 2 },
        },
      ],
    });
  }

  if (filters.month && filters.month !== "all") {
    const financialMonth = Number(filters.month);

    andConditions.push({
      month: getCalendarMonthFromFinancialMonth(
        financialMonth,
      ),
    });
  }

  if (andConditions.length === 1) {
    return andConditions[0];
  }

  return {
    AND: andConditions,
  };
}

export function buildFilters(filters: Filters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};

  // ✅ Company filter
  if (filters.company && filters.company !== "all") {
    where.companyId = filters.company;
  }

  // ✅ Project filter
  if (filters.project && filters.project !== "all") {
    where.id = filters.project;
  }

  // ✅ Start Date filter
  if (filters.startDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);

    where.startDate = {
      gte: start,
    };
  }

  // ✅ End Date filter
  if (filters.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);

    where.endDate = {
      lte: end,
    };
  }

  // 🔥 FINANCIAL YEAR LOGIC (Apr–Mar)
  if (
    (filters.year && filters.year !== "all") ||
    (filters.month && filters.month !== "all")
  ) {
    where.monthlyPLs = {
      some: buildMonthlyPLFilters(filters),
    };
  }

  return where;
}
