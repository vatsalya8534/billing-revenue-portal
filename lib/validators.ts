import { z } from "zod"
import { Status, PaymentReceived } from "@prisma/client"

export const statusEnum = z.nativeEnum(Status)
export const paymentReceivedEnum = z.nativeEnum(PaymentReceived)

export const roleSchema = z.object({
  roleName: z.string().min(2, "Role name is required"),
  createdBy: z.string().min(2, "Created by is required"),
  remark: z.string().optional(),
});


export const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required").optional(), // optional for updates
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  status: z.nativeEnum(Status),
  roleId: z.number().min(1, "Role is required"), 
  remark: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  id: z.number().optional(),
  poNumber: z.string().min(1, "PO Number is required"),
  serviceType: z.string().min(1, "Service Type is required"),
  startFrom: z.string().min(1, "Start Date is required"), 
  endDate: z.string().min(1, "End Date is required"),
  contractType: z.string().min(1, "Contract Type is required"),
  contractDuration: z.string().min(1, "Contract Duration is required"),
  paymentTerms: z.string().min(1, "Payment Terms are required"),
  billingPlan: z.string().min(1, "Billing Plan is required"),
  poAmount: z.coerce.number().positive("PO Amount must be greater than 0"),
  status: statusEnum.optional(),
  createdByUserId: z.coerce.number(),
  remark: z.string().optional(),
})