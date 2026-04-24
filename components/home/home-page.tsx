"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";
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
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800 overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-100 blur-3xl opacity-70" />
      <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-indigo-100 blur-3xl opacity-60" />

      <div className="relative z-10 px-6 md:px-12 lg:px-20 py-8">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            {logo && (
              <Image
                src={logo}
                alt={companyName}
                width={48}
                height={48}
                className="rounded-xl shadow-md"
              />
            )}
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {companyName}
            </h1>
          </div>
        </header>

        {/* HERO */}
        <section className="grid lg:grid-cols-2 gap-10 items-center mb-24">
          {/* Left */}
          <div>
            <p className="text-blue-600 font-medium mb-4">
              Financial Operations Simplified
            </p>

            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              One Portal for
              <span className="block text-blue-600">
                Revenue & Billing
              </span>
            </h2>

            <p className="text-slate-500 text-lg mt-6 max-w-xl leading-relaxed">
              Manage revenue streams, billing workflows, and profit analysis in
              one clean and reliable workspace.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-7 rounded-2xl"
                onClick={() => router.push("/admin/dashboard?tab=revenue")}
              >
                Open Revenue Dashboard
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-2xl px-7"
                onClick={() => router.push("/admin/dashboard?tab=pl")}
              >
                Open P&L
              </Button>
            </div>
          </div>

          {/* Right */}
          <div className="relative">
            <Card className="rounded-3xl shadow-xl border-none bg-white">
              <CardContent className="p-8">
                <div className="grid gap-5">
                  <div className="rounded-2xl bg-blue-50 p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Revenue Tracking</h4>
                      <p className="text-sm text-slate-500">
                        Monitor payments & collections
                      </p>
                    </div>
                    <DollarSign className="text-blue-600" />
                  </div>

                  <div className="rounded-2xl bg-indigo-50 p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Profit & Loss</h4>
                      <p className="text-sm text-slate-500">
                        Analyze performance
                      </p>
                    </div>
                    <BarChart3 className="text-indigo-600" />
                  </div>

                  <div className="rounded-2xl bg-sky-50 p-5 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Billing Management</h4>
                      <p className="text-sm text-slate-500">
                        Organize billing cycles
                      </p>
                    </div>
                    <FileText className="text-sky-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* floating mini card */}
            <div className="absolute -top-6 -left-9 bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-3">
              <TrendingUp className="text-green-500" />
              <div>
                <p className="text-sm font-semibold">Smarter Decisions</p>
                <p className="text-xs text-slate-500">Data-driven insights</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid md:grid-cols-3 gap-6 mb-24">
          {[
            {
              icon: DollarSign,
              title: "Revenue Tracking",
              desc: "Track all financial activities in real time.",
            },
            {
              icon: BarChart3,
              title: "P&L Insights",
              desc: "Understand profitability clearly.",
            },
            {
              icon: FileText,
              title: "Billing Control",
              desc: "Manage billing efficiently.",
            },
          ].map((item, i) => (
            <Card
              key={i}
              className={`rounded-3xl border-none shadow-md hover:shadow-xl transition-all ${
                i === 1 ? "md:-mt-6" : ""
              }`}
            >
              <CardContent className="p-8">
                <item.icon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-slate-500 mt-2">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* CTA */}
        <section className="bg-white rounded-[32px] shadow-lg p-10 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold">Ready to manage finances?</h3>
            <p className="text-slate-500 mt-2">
              Access your dashboards and insights instantly.
            </p>
          </div>

          <Button
            size="lg"
            className="mt-5 md:mt-0 bg-blue-600 hover:bg-blue-700 rounded-2xl"
            onClick={() => router.push("/admin/dashboard?tab=pl")}
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-sm text-slate-500 mt-12">
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </footer>
      </div>
    </div>
  );
}