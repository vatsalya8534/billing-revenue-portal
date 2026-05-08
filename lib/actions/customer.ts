"use server";

import { Customer } from "@/types";
import { prisma } from "../prisma";
import { customerSchema } from "../validators";
import { formatError } from "../utils";

export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: {
      createdAt: 'desc'
    },
  })
}

export async function createCustomer(data: Customer) {

  try {
    const customer = customerSchema.parse(data)

    await prisma.customer.create({
      data: {
        customerCode: customer.customerCode || "",
        phone: customer.phone,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        companyName: customer.companyName,
        alternatePhone: customer.alternatePhone,
        addressLine1: customer.addressLine1,
        addressLine2: customer.addressLine2,
        city: customer.city,
        state: customer.state,
        country: customer.country,
        postalCode: customer.postalCode,
        gstNumber: customer.gstNumber,
        panNumber: customer.panNumber,
        website: customer.website,
        remark: customer.remark,
        status: customer.status
      }
    })

    return {
      success: true,
      message: "Customer created successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
export async function getCustomerById(id: string) {
  try {

    let customer = await prisma.customer.findFirst({
      where: { id }
    })

    if (customer) {
      return {
        success: true,
        data: customer,
        message: "Customer fetched successfully"
      }
    }

    return {
      success: false,
      message: "Customer not found"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function updateCustomer(data: Customer, id: string) {
  try {

    const customer = customerSchema.parse(data)

    await prisma.customer.update({
      where: { id },
      data: {
        customerCode: customer.customerCode,
        phone: customer.phone,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        companyName: customer.companyName,
        alternatePhone: customer.alternatePhone,
        addressLine1: customer.addressLine1,
        addressLine2: customer.addressLine2,
        city: customer.city,
        state: customer.state,
        country: customer.country,
        postalCode: customer.postalCode,
        gstNumber: customer.gstNumber,
        panNumber: customer.panNumber,
        website: customer.website,
        remark: customer.remark,
        status: customer.status
      }
    })

    return {
      success: true,
      message: "Customer updated successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}

export async function deleteCustomer(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            purchaseOrders: true
          }
        }
      }
    })

    if (!customer) {
      return {
        success: false,
        message: "Customer not found"
      }
    }

    if (customer._count.purchaseOrders > 0) {
      return {
        success: false,
        message: "Customer cannot be deleted because it is linked to purchase orders."
      }
    }

    await prisma.customer.delete({
      where: { id }
    })

    return {
      success: true,
      message: "Customer deleted successfully"
    }

  } catch (error) {
    return {
      success: false,
      message: formatError(error)
    }
  }
}
