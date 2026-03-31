import { Prisma } from "@prisma/client";

type Filters = {
    company?: string;
    project?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
};

export function buildFilters(filters: Filters): Prisma.ProjectWhereInput {
    const where: Prisma.ProjectWhereInput = {};


    if (filters.company && filters.company !== "all") {
        where.companyId = filters.company;
    }

    if (filters.project && filters.project !== "all") {
        where.id = filters.project;
    }
    if (filters.startDate) {
        const start = filters.startDate
            ? new Date(new Date(filters.startDate).setHours(0, 0, 0, 0))
            : undefined;

        const end = filters.endDate
            ? new Date(new Date(filters.endDate).setHours(23, 59, 59, 999))
            : undefined;

        where.startDate = {
            ...(start && { gte: start }),
            ...(end && { lte: end }),
        };
    }

    if (filters.endDate) {
        const start = new Date(new Date(filters.endDate).setHours(0, 0, 0, 0));
        const end = new Date(new Date(filters.endDate).setHours(23, 59, 59, 999));

        where.endDate = {
            gte: start,
            lte: end,
        };
    }


    return where;
}


