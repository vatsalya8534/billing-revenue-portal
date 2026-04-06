"use client"

import * as React from "react"
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

} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Revenue",
      url: "/admin/revenue",
      icon: IconTrendingUp,
    },
    {
      title: "P&L",
      url: "/admin/pl",
      icon: IconBriefcase,
    },

    {
      title: "Contract Type",
      url: "/admin/contract-type",
      icon: IconContract,
    },
    {
      title: "Service Type",
      url: "/admin/service-type",
      icon: IconTypeface,
    },
    {
      title: "Billing Plan",
      url: "/admin/billing-plan",
      icon: IconReceipt,
    },
    {
      title: "Contract Duration",
      url: "/admin/contract-duration",
      icon: IconContract,
    },
    {
      title: "Customer",
      url: "/admin/customer",
      icon: IconUserCircle,
    },
    {
      title: "Company",
      url: "/admin/company",
      icon: IconBuilding,
    },

    {
      title: "Users",
      url: "/admin/users",
      icon: IconUser,
    },
    {
      title: "Roles",
      url: "/admin/roles",
      icon: IconUserCog,
    },
    {
      title: "Module",
      url: "/admin/module",
      icon: IconPackage,
    },
  ],
  navSecondary: [

  ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name?: string;
    email?: string;
    image?: string;
    allowedRoutes?: string[];
  };
};

function filterNav(navMain: any[], allowedRoutes: string[]) {
  return navMain
    .map((section) => {
      if (!section.items) {
        return allowedRoutes.includes(section.url) ? section : null;
      }

      const filteredItems = section.items.filter((item: any) =>
        allowedRoutes.includes(item.url),
      );

      if (filteredItems.length === 0) return null;

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter(Boolean);
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {

  const allowedRoutes = user?.allowedRoutes || [];

  const filteredNav = filterNav(data.navMain, allowedRoutes);

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="fixed top-0 left-0 h-screen border-r"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin/dashboard">
                <span className="text-base font-semibold">
                  Billing Tracking
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        <NavMain items={filteredNav} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
