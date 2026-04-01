import { auth } from "@/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function ({ children }: { children: React.ReactNode }) {

  const session: any = await auth()

  if (!session) redirect("/login")

  const userRoles = session?.user?.email
    ? await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        role: {
          include: {
            roleModules: {
              include: {
                module: true,
              },
            },
          },
        },
      },
    })
    : null;

  const allowedRoutes = userRoles?.role?.roleModules?.map((rm) => rm.module.route) || []

  const user = userRoles ? {
    name: userRoles.firstName || undefined,
    email: userRoles.email || undefined,
    allowedRoutes,
  } : undefined;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 p-4">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

