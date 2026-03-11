import { email, nullable, z } from "zod"
import { Status, PaymentReceived, POStatus } from "@prisma/client"

export const statusEnum = z.nativeEnum(Status)
export const paymentReceivedEnum = z.nativeEnum(PaymentReceived)

export const loginFormSchema = z.object({
  username: z.string("Invalid username"),
  password: z.string().min(6, "Password should be at least 6 characters long")
})

export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Role name is required"),
  remark: z.string().nullable().optional(),
  status: z.enum(Object.values(Status)),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const userSchema = z.object({
  id: z.string().optional(),
  password: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required"),
  status: z.enum(Object.values(Status)),
  roleId: z.string().min(1, "Role is required"),
  remark: z.string().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(1, "Password is required"),
});

export const purchaseOrderSchema = z.object({
  id: z.string().optional(),
  customerPONumber: z.string().min(1, "Customer PO Number is required"),
  poAmount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "PO Amount must be positive")
  ),
  serviceType: z.string().min(1, "Service Type is required"),
  contractDuration: z.string().min(1, "Contract Duration is required"),

  contractType: z.string().min(1, "Contract Type is required"),
  startFrom: z.union([z.date(), z.string()]).nullable().optional(),
  endDate: z.union([z.date(), z.string()]).nullable().optional(),
  paymentTerms: z.string().min(1, "Payment Terms are required"),
  billingPlan: z.string().min(1, "Billing Plan is required"),

  billingNumber: z.string().min(1, "Billing Number is required"),
  customerName: z.string().min(1, "Billing Number is required"),
  billDate: z.union([z.date(), z.string()]).nullable().optional(),
  billSubmittedDate: z.union([z.date(), z.string()]).nullable().optional(),
  paymentReceived: z.enum(Object.values(PaymentReceived)),
  paymentReceivedDate: z.union([z.date(), z.string()]).nullable().optional(),
  paymentReceivedAmount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "PO Amount must be positive")
  ),

  status: z.enum(Object.values(POStatus)),
  remark: z.string().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const serviceTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Service Type name is required"),
  remark: z.string().nullable().optional(),
  status: z.enum(Object.values(Status)),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const contractTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Contract Type name is required"),
  remark: z.string().nullable().optional(),
  status: z.enum(Object.values(Status)),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const billingPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
   totalBillingCycles: z.coerce.number(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  remark: z.string().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().optional()
})