"use client"

import * as React from "react"
import {
  IconContract,
  IconFileDescription,
  IconReceipt,
  IconSettings,
  IconTypeface,
  IconUser,
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Purchase Orders",
      url: "/admin/purchase-orders",
      icon: IconFileDescription,
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
      url: "/admin/billing-plans",
      icon: IconReceipt,
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
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <span className="text-base font-semibold">Billing Tracking</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
