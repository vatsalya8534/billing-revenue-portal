"use client";

import * as React from "react";
import {
  IconBriefcase,
  IconBuilding,
  IconContract,
  IconDashboard,
  IconPackage,
  IconReceipt,
  IconTrendingUp,
  IconTypeface,
  IconUser,
  IconUserCircle,
  IconUserCog,
  IconHome,
} from "@tabler/icons-react";

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

import Link from "next/link";
import { SettingsIcon } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { userLoginRequest } from "@/store/actions/user-actions";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    { title: "Home", url: "/admin/home", icon: IconHome },
    { title: "Dashboard", url: "/admin/dashboard", icon: IconDashboard },

    // ✅ FIXED: Tab-based routing
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

// ✅ FIXED FILTER LOGIC
function filterNav(navMain: any[], allowedRoutes: string[]) {
  return navMain.filter((item) => {
    // Always show Home
    if (item.url === "/admin/home") return true;

    // If no restrictions → show all
    if (!allowedRoutes.length) return true;

    // Otherwise filter
    return allowedRoutes.includes(item.url);
  });
}

export function AppSidebar({ user, configuration, ...props }: AppSidebarProps) {
  const allowedRoutes = user?.allowedRoutes || [];
  const filteredNav = filterNav(data.navMain, allowedRoutes);
  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch(userLoginRequest(user))
  }, [])

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="fixed top-0 left-0 h-screen border-r bg-white"
    >
      {/* 🔹 HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="p-2">
              <Link href="/admin/home">
                <div className="flex items-center gap-2">
                  
                  {/* LOGO */}
                  <Image
                    src={configuration?.logo || "/sy.png"}
                    alt="logo"
                    width={28}
                    height={28}
                    className="rounded-md"
                  />

                  {/* TEXT (hidden when collapsed) */}
                  <span className="text-sm font-semibold whitespace-nowrap group-data-[collapsible=icon]:hidden">
                    {configuration?.name?.toUpperCase() || "SY ASSOCIATES"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 🔹 MAIN NAV */}
      <SidebarContent className="overflow-y-auto">
        <NavMain items={filteredNav} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}