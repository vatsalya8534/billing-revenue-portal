// import { Separator } from "@/components/ui/separator"
// import { SidebarTrigger } from "@/components/ui/sidebar"
// import { DashboardHeader } from "./dashboard-header"

// export function SiteHeader() {
//   return (
//     <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background">
//       <div className="flex w-full items-center gap-3 px-4 lg:px-6">

//         {/* Sidebar Toggle */}
//         <SidebarTrigger className="-ml-1" />

//         <Separator
//           orientation="vertical"
//           className="h-4"
//         />

//         {/* Portal Title */}
//         <h1 className="text-lg font-semibold tracking-tight">
//           Billing and Revenue Portal
//         </h1>

//       </div>
//     </header>
//   )
// }
"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function SiteHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Optional: clear auth tokens/session here
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
        {/* <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button> */}

      </div>
    </header>
  );
}