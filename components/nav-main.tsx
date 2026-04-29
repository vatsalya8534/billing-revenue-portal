"use client"

import Link from "next/link"
import type * as React from "react"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1.5">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={
                  pathname === item.url
                    ? "rounded-xl bg-gradient-to-r from-sky-500 via-sky-500 to-cyan-500 text-white shadow-[0_14px_36px_-20px_rgba(14,165,233,0.8)] hover:from-sky-500 hover:via-sky-500 hover:to-cyan-500 hover:text-white active:scale-[0.98] group-data-[collapsible=icon]:rounded-full"
                    : "rounded-xl text-slate-200/95 hover:bg-white/7 hover:text-white active:bg-white/12 active:text-white group-data-[collapsible=icon]:rounded-full"
                }
              >
                <Link
                  href={item.url}
                  className="flex w-full items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
