"use server";

import { Company, } from "@/types";
import { prisma } from "../prisma";
import { companySchema } from "../validators";
import { formatError, incrementCode } from "../utils";

export async function getCompanys() {
  return await prisma.company.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function createCompany(data: Company) {

  try {
    const totalCompanies = await getCompanys()

    const companyCode = "COMP-" + incrementCode(String(totalCompanies.length)) 

    const company = companySchema.parse(data)

    await prisma.company.create({
      data: {
        name: company.name,
        companyCode: companyCode,
        email: company.email,
        phone: company.phone,
        alternatePhone: company.alternatePhone,
        addressLine1: company.addressLine1,
        addressLine2: company.addressLine2,
        city: company.city,
        state: company.state,
        country: company.country,
        pincode: company.pincode,
        gstNumber: company.gstNumber,
        panNumber: company.panNumber,
        cinNumber: company.cinNumber,
        status: company.status,
      }
    })

    return {
      success: true,
      message: "company created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getcompanyById(id: string) {
  try {

    let company = await prisma.company.findFirst({
      where: { id }
    })

    if (company) {
      return {
        success: true,
        data: company,
        message: "company fetched successfully"
      }
    }

    return {
      success: false,
      message: "company not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function updateCompany(data: Company, id: string) {
  try {

    const company = companySchema.parse(data)

    await prisma.company.update({
      where: { id },
      data: {
        name: company.name,
        email: company.email,
        phone: company.phone,
        alternatePhone: company.alternatePhone,
        addressLine1: company.addressLine1,
        addressLine2: company.addressLine2,
        city: company.city,
        state: company.state,
        country: company.country,
        pincode: company.pincode,
        gstNumber: company.gstNumber,
        panNumber: company.panNumber,
        cinNumber: company.cinNumber,
        status: company.status,
      }
    })

    return {
      success: true,
      message: "company updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteCompany(id: any) {
  try {
    await prisma.company.delete({
      where: { id }
    })

    return {
      success: true,
      message: "company deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
