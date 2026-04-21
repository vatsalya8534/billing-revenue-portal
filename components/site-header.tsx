"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { signOut } from "@/auth";
import { userLogoutRequest } from "@/store/actions/user-actions";
import { logoutUser } from "@/lib/actions/users";

export function SiteHeader() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user  as any)
  const dispatch = useDispatch();
  

  const handleLogout = async () => {
    dispatch(userLogoutRequest())

    await logoutUser();
    
    router.push("/login"); // redirect to login
  };

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b bg-background">
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">

        {/* Sidebar Toggle */}
        <SidebarTrigger className="-ml-1" />

        <Separator orientation="vertical" className="h-4" />

        {/* Spacer pushes Logout button to the right */}
        <div className="flex-1" />

        {/* Logout Button */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <span>{user?.name}</span>
              <ChevronDown className="w-4 h-4"/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}