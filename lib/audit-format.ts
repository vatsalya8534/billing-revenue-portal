export type AuditChange = {
  from: unknown
  to: unknown
}

export type ActivityLogRow = {
  id: string
  createdAt: string
  userName: string | null
  action: "CREATE" | "UPDATE" | "DELETE"
  model: string
  recordId: string | null
  summary: string
  before: unknown
  after: unknown
  changes: Record<string, AuditChange> | null
}

const TIMESTAMP_FIELDS = new Set(["createdAt", "updatedAt"])

export function fieldLabel(field: string) {
  const spaced = field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")

  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export function summarizeAuditChanges(
  action: "CREATE" | "UPDATE" | "DELETE",
  changes: unknown,
) {
  if (action === "CREATE") return "Created"
  if (action === "DELETE") return "Deleted"

  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    return "Updated"
  }

  const fields = Object.keys(changes).filter((field) => !TIMESTAMP_FIELDS.has(field))
  if (fields.length === 0) return "Updated"

  const shown = fields.slice(0, 4).map(fieldLabel)
  const extra = fields.length - shown.length

  return extra > 0 ? `${shown.join(", ")} +${extra}` : shown.join(", ")
}

export function formatAuditValue(value: unknown) {
  if (value == null || value === "") return "—"
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)

  return JSON.stringify(value, null, 2)
}

export function auditChanges(
  changes: unknown,
): Record<string, AuditChange> | null {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    return null
  }

  return changes as Record<string, AuditChange>
}
