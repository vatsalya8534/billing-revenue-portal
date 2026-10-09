import { redirect } from "next/navigation"

import { getAuditLogs } from "@/lib/actions/audit-log"
import { canAccess } from "@/lib/rbac"

import { ActivityLogView } from "./activity-log-view"

export const dynamic = "force-dynamic"

type ActivityLogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ActivityLogPage({
  searchParams,
}: ActivityLogPageProps) {
  const canView = await canAccess("/admin/activity-log", "view")

  if (!canView) {
    redirect("/404")
  }

  const params = await searchParams
  const logs = await getAuditLogs({
    q: firstParam(params.q),
    model: firstParam(params.model),
    action: firstParam(params.action),
    page: firstParam(params.page),
  })

  return <ActivityLogView {...logs} />
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
