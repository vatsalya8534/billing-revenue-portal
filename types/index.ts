import z from "zod"
import {
  roleSchema,
  userSchema,
  purchaseOrderSchema,
  serviceTypeSchema,
  contractTypeSchema,
  billingPlanSchema
} from "@/lib/validators"

export type Role = z.infer<typeof roleSchema>
export type User = z.infer<typeof userSchema>
export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>
export type ContractType = z.infer<typeof contractTypeSchema>
export type ServiceType = z.infer<typeof serviceTypeSchema>
export type BillingPlan = z.infer<typeof billingPlanSchema>

