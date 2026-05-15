"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconBell,
  IconChevronUp,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { logoutUser } from "@/lib/actions/users"

export function NavUser({
  user,
}: {
  user?: {
    name?: string
    email?: string
  }
}) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const handleLogout = async () => {
    await logoutUser()
    router.push("/login")
  }

  if (!isMounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="h-auto rounded-2xl bg-white/6 px-3 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/8 text-sky-200">
              <IconUserCircle className="size-5" />
            </div>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{user?.name || "Admin User"}</span>
              <span className="truncate text-xs text-slate-400">
                {user?.email || "No email available"}
              </span>
            </div>
            <IconChevronUp className="ml-auto size-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-auto rounded-2xl bg-white/6 px-3 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/8 text-sky-200">
                <IconUserCircle className="size-5" />
              </div>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user?.name || "Admin User"}</span>
                <span className="truncate text-xs text-slate-400">
                  {user?.email || "No email available"}
                </span>
              </div>
              <IconChevronUp className="ml-auto size-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-60 rounded-xl border-sky-100 bg-white/95 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.28)] backdrop-blur"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={10}
          >
            <DropdownMenuLabel className="px-3 py-3 font-normal">
              <div className="space-y-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.name || "Admin User"}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email || "No email available"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem asChild>
            <Link href="/admin/profile" className="cursor-pointer">
              <IconUserCircle className="size-4" />
                Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/admin/configuration" className="cursor-pointer">
                  <IconSettings className="size-4" />
                  Configuration
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700">
              <IconLogout className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
