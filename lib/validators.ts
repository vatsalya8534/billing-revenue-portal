import { z } from "zod";
import { Status, PaymentReceived, POStatus, OrderType, CompanyStatus } from "@prisma/client";

/* ---------------- ENUMS ---------------- */
export const statusEnum = z.nativeEnum(Status);
export const paymentReceivedEnum = z.nativeEnum(PaymentReceived);
export const poStatusEnum = z.nativeEnum(POStatus);

/* ---------------- AUTH ---------------- */
export const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password should be at least 6 characters long"),
});

/* ---------------- ROLE ---------------- */
export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Role name is required"),
  remark: z.string().nullable().optional(),
  status: statusEnum,
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

/* ---------------- USER ---------------- */
export const userSchema = z.object({
  id: z.string().optional(),
  password: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  status: statusEnum,
  roleId: z.string().min(1, "Role is required"),
  remark: z.string().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

export const createUserSchema = userSchema.extend({
  password: z.string().min(1, "Password is required"),
});

/* ---------------- BILLING CYCLE ---------------- */
export const billingCycleSchema = z.object({
  id: z.string().optional(),
  purchaseOrderId: z.string().optional(),
  billingSubmittedDate: z.union([z.date(), z.string()]).nullable().optional(),
  paymentReceived: paymentReceivedEnum,
  paymentReceivedDate: z.union([z.date(), z.string()]).nullable().optional(),
  paymentDueDate: z.union([z.date(), z.string()]).nullable().optional(),
  billingRemark: z.string().optional(),
  collectedAmount: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().optional()
  ),
  invoiceAmount: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().optional()
  ),

  invoiceDate: z.union([z.date(), z.string()]).nullable().optional(),

  invoiceNumber: z.string().optional(),
  tds: z.coerce.number(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

/* ---------------- PURCHASE ORDER ---------------- */
export const purchaseOrderSchema = z.object({
  id: z.string().optional(),

  customerPONumber: z.string().min(1, "Customer PO Number is required"),

  poAmount: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "PO Amount must be positive")
  ),

  serviceTypeId: z.string().min(1, "Service Type is required"),
  contractDurationId: z.string().min(1, "Contract Duration is required"),
  contractId: z.string().min(1, "Contract Type is required"),
  companyId: z.string().optional(), 

  startFrom: z.union([z.date(), z.string()]).nullable().optional(),
  endDate: z.union([z.date(), z.string()]).nullable().optional(),

  paymentTerms: z.string().min(1, "Payment Terms are required"),

  billingPlanId: z.string().min(1, "Billing Plan is required"),
  customerId: z.string().min(1, "Customer is required"),

  poOwner: z.string().min(1, "PO owner is required"),

  billingCycles: z.array(billingCycleSchema).default([]),

  status: poStatusEnum,

  remark: z.string().optional(),

  ageingDays: z.number().min(0).optional(),

  scope: z.string().optional().default(""),

  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

/* ---------------- SERVICE TYPE ---------------- */
export const serviceTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Service Type name is required"),
  remark: z.string().nullable().optional(),
  status: statusEnum,
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

/* ---------------- CONTRACT TYPE ---------------- */
export const contractTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Contract Type name is required"),
  remark: z.string().nullable().optional(),
  status: statusEnum,
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
});

/* ---------------- BILLING PLAN ---------------- */
export const billingPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  totalBillingCycles: z.coerce.number(),
  status: statusEnum,
  remark: z.string().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().optional(),
  billingCycleType: z.enum(["START", "MID", "END"]),
});

/* ---------------- CONTRACT DURATION ---------------- */
export const contractDurationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  totalNumberOfMonths: z.coerce.number(),
  status: statusEnum,
  remark: z.string().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().optional(),
});

/* ---------------- CUSTOMER ---------------- */
export const customerSchema = z.object({
  id: z.string().optional(),
  customerCode: z.string().optional(),

  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),

  phone: z.string().min(1, "Phone number is required"),
  companyName: z.string().optional(),

  alternatePhone: z.string().optional(),

  email: z.string().email("Invalid email address").optional(),

  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),

  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

  postalCode: z.string().optional(),

  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),

  website: z.string().optional(),

  remark: z.string().nullable().optional(),

  status: statusEnum,

  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().optional(),
});


export const companySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Company Name is required"),
  companyCode: z.string().optional(),
  email: z.string().min(1, "Email is required"),
  phone: z.string().min(1, "Phone is required"),
  alternatePhone: z.string().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().min(1, "Pincode is required"),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  cinNumber: z.string().optional(),
  status: z.enum(Object.values(CompanyStatus)),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().optional(),
})

export const projectMonthlyPLSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().optional(),
  month: z.int(),
  year: z.int(),
  billedAmount: z.coerce.number(),
  fms: z.coerce.number(),
  spare: z.coerce.number(),
  otherCost: z.any(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().optional()
})

export const projectSchema = z.object({
  id: z.string().optional(),
  companyId: z.string().min(1, "company is required"),
  projectName: z.string().min(1, "projectName is required"),
  startDate: z.union([z.date(), z.string().min(1, "Start Date is required")]),
  endDate: z.union([z.date(), z.string()]).nullable().optional(),
  poValue: z.coerce.number().min(1, "PO value is required"),
  resourceCount: z.coerce.number().min(1, "total resource count"),
  billingPlanId: z.string().min(1, "Billing Plan is required"),
  orderType: z.enum(Object.values(OrderType)),
  status: z.enum(Object.values(Status)),
  billingCycle: z.array(projectMonthlyPLSchema).default([]),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().optional(),
})
