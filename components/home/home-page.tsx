"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, DollarSign, FileText, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type HomePageProps = {
  configuration?: {
    name?: string | null;
    logo?: string | null;
  };
};

export default function HomePage({ configuration }: HomePageProps) {
  const router = useRouter();
  const companyName = configuration?.name || "";
  const logo = configuration?.logo || "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Company Logo"
            width={50}
            height={50}
            className="rounded-md"
          />
          <h1 className="text-2xl font-bold uppercase tracking-wide text-[#1E3A8A]">
            {companyName}
          </h1>
        </div>
      </header>

      {/* HERO */}
      <section className="text-center max-w-3xl mx-auto mb-14">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Billing & Revenue <br />
          <span className="text-[#3B82F6]">Management Portal</span>
        </h2>

        <p className="text-gray-600 text-lg mt-4">
          A secure and reliable platform to track revenue, manage billing
          cycles, and analyze profit & loss with clarity and precision.
        </p>
      </section>

      {/* ACTION BUTTONS */}
      <div className="flex justify-center gap-6 mb-16 flex-wrap">
        <Button
          size="lg"
          variant="outline"
          className="cursor-pointer border-[#3B82F6] text-[#1E3A8A] hover:bg-[#3B82F6] hover:text-white px-6 py-3"
          onClick={() => router.push("/admin/dashboard?tab=pl")}
        >
          <BarChart3 className="mr-2 h-5 w-5" />
          Profit & Loss (P&L)
        </Button>

        <Button
          size="lg"
          className="cursor-pointer bg-[#1E3A8A] hover:bg-[#3B82F6] text-white px-6 py-3 shadow-md"
          onClick={() => router.push("/admin/dashboard?tab=revenue")}
        >
          <DollarSign className="mr-2 h-5 w-5" />
          Revenue Dashboard
        </Button>
      </div>

      {/* FEATURES (NOW 3 CARDS) */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
        <Card className="shadow-md hover:shadow-xl transition duration-300 border border-blue-100">
          <CardContent className="p-6 text-center">
            <DollarSign className="mx-auto mb-4 h-8 w-8 text-[#3B82F6]" />
            <h3 className="font-semibold text-lg mb-2">Revenue Tracking</h3>
            <p className="text-sm text-gray-500">
              Track all invoices, payments, and collections in real-time with
              complete visibility.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition duration-300 border border-blue-100">
          <CardContent className="p-6 text-center">
            <BarChart3 className="mx-auto mb-4 h-8 w-8 text-[#3B82F6]" />
            <h3 className="font-semibold text-lg mb-2">
              Profit & Loss Analysis
            </h3>
            <p className="text-sm text-gray-500">
              Analyze financial performance with accurate P&L insights and cost
              breakdowns.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-xl transition duration-300 border border-blue-100">
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto mb-4 h-8 w-8 text-[#3B82F6]" />
            <h3 className="font-semibold text-lg mb-2">Billing Management</h3>
            <p className="text-sm text-gray-500">
              Manage billing cycles, invoices, and payment schedules
              efficiently.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* EXTRA CONTENT */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h3 className="text-2xl font-semibold mb-4 text-[#1E3A8A]">
          Why Choose This Portal?
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Designed for businesses that need clarity in financial operations,
          this portal provides a centralized system to manage billing, monitor
          revenue streams, and evaluate profitability.
        </p>
      </section>

      {/* HIGHLIGHTS */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16 text-center">
        <div>
          <TrendingUp className="mx-auto mb-2 text-[#3B82F6]" />
          <p className="text-xl font-bold">Reliable Insights</p>
          <p className="text-gray-500 text-sm">Accurate financial reporting</p>
        </div>

        <div>
          <DollarSign className="mx-auto mb-2 text-[#3B82F6]" />
          <p className="text-xl font-bold">Better Cash Flow</p>
          <p className="text-gray-500 text-sm">Track income efficiently</p>
        </div>

        <div>
          <BarChart3 className="mx-auto mb-2 text-[#3B82F6]" />
          <p className="text-xl font-bold">Data Driven</p>
          <p className="text-gray-500 text-sm">Make smarter decisions</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} {companyName}. All rights reserved.
      </footer>
    </div>
  );
}
