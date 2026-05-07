"use client";

import * as React from "react";
import {
  IconBriefcase,
  IconBuilding,
  IconContract,
  IconDashboard,
  IconHome,
  IconPackage,
  IconReceipt,
  IconTrendingUp,
  IconTypeface,
  IconUser,
  IconUserCircle,
  IconUserCog,
} from "@tabler/icons-react";
import { SettingsIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { userLoginRequest } from "@/store/actions/user-actions";

const data = {
  navMain: [
    { title: "Home", url: "/admin/home", icon: IconHome },
    { title: "Revenue", url: "/admin/revenue", icon: IconTrendingUp },
    { title: "P&L", url: "/admin/pl", icon: IconBriefcase },
    { title: "Contract Type", url: "/admin/contract-type", icon: IconContract },
    { title: "Service Type", url: "/admin/service-type", icon: IconTypeface },
    { title: "Billing Plan", url: "/admin/billing-plan", icon: IconReceipt },
    { title: "Contract Duration", url: "/admin/contract-duration", icon: IconContract },
    { title: "Customer", url: "/admin/customer", icon: IconUserCircle },
    { title: "Company", url: "/admin/company", icon: IconBuilding },
    { title: "Users", url: "/admin/users", icon: IconUser },
    { title: "Roles", url: "/admin/roles", icon: IconUserCog },
    { title: "Module", url: "/admin/module", icon: IconPackage },
    { title: "Configuration", url: "/admin/configuration", icon: SettingsIcon },
  ],
  navSecondary: [],
};

type NavItem = (typeof data.navMain)[number];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name?: string;
    email?: string;
    image?: string;
    allowedRoutes?: string[];
  };
  configuration?: {
    name?: string | null;
    logo?: string | null;
  };
};

function filterNav(navMain: NavItem[], allowedRoutes: string[]) {
  return navMain.filter((item) => {
    if (item.url === "/admin/home") return true;
    if (!allowedRoutes.length) return true;
    return allowedRoutes.includes(item.url);
  });
}

export function AppSidebar({ user, configuration, ...props }: AppSidebarProps) {
  const dispatch = useDispatch();
  const allowedRoutes = user?.allowedRoutes || [];
  const filteredNav = filterNav(data.navMain, allowedRoutes);

  React.useEffect(() => {
    dispatch(userLoginRequest(user));
  }, [dispatch, user]);

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      {...props}
      className="fixed top-0 left-0 h-screen !border-r-0"
    >
      <SidebarHeader className="bg-[linear-gradient(180deg,rgba(8,47,73,0.98),rgba(14,116,144,0.94),rgba(12,74,110,0.98))] px-3 py-3 text-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto rounded-2xl bg-white/6 p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white/10 hover:text-white data-[active=true]:bg-white/10 data-[active=true]:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-2"
            >
              <Link href="/admin/home">
                <div className="flex w-full items-center gap-3">
                  <Image
                    src={configuration?.logo || "/sy.png"}
                    alt="logo"
                    width={44}
                    height={44}
                    className="rounded-xl bg-white/95 object-cover p-1 shadow-[0_12px_28px_-18px_rgba(15,23,42,0.6)]"
                  />
                  <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-100/65">
                      Operations Hub
                    </p>
                    <p className="truncate text-base font-semibold text-white">
                      {configuration?.name?.toUpperCase() || "SY ASSOCIATES"}
                    </p>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="sidebar-scrollbar overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.12),_transparent_20%),linear-gradient(180deg,#082f49_0%,#0f172a_48%,#020617_100%)]">
        <NavMain items={filteredNav} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter className="bg-[linear-gradient(180deg,rgba(2,6,23,0.72),rgba(2,6,23,0.96))] px-3 py-3 text-white backdrop-blur-xl">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
