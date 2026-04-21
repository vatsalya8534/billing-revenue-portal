import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getAllowedRoute, getUserPermissions } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { getConfiguration } from "@/lib/actions/configuration";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ AUTH CHECK
  const session: any = await auth();

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  // ✅ RBAC PERMISSIONS
  const userRoles = await getUserPermissions();

  const allowedRoutes = await Promise.all(
    (userRoles?.role?.roleModules || []).map(async (rm: any) => {
      return await getAllowedRoute(rm.module.route);
    })
  );

  const user = userRoles
    ? {
      name: userRoles.firstName || undefined,
      email: userRoles.email || undefined,
      allowedRoutes,
    }
    : undefined;

  // ✅ FETCH CONFIGURATION (COMPANY NAME + LOGO)
  const configData = await getConfiguration();

  const configuration = configData
    ? {
      name: configData.name,
      logo: configData.logo,
    }
    : undefined;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* ✅ SIDEBAR WITH USER + CONFIG */}
      <AppSidebar user={user} configuration={configuration} />

      <SidebarInset>
        {/* ✅ TOP HEADER */}
        <div className="sticky top-0 z-50 bg-white">
          <SiteHeader />
        </div>

        {/* ✅ MAIN CONTENT */}
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}