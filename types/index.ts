import z from "zod"
import {
  roleSchema,
  userSchema,
  purchaseOrderSchema
} from "@/lib/validators"


export type Role = z.infer<typeof roleSchema>

export type User = z.infer<typeof userSchema>

export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>
