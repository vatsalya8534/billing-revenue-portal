"use client"; // must be client

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any auth tokens if you have them
    // localStorage.clear(); // optional
    router.push("/login"); // redirect to login
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100 shadow">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}