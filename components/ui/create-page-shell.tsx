import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CreatePageShellProps = {
  title: string;
  backHref: string;
  backLabel?: string;
  children: ReactNode;
};

export function CreatePageShell({
  title,
  backHref,
  backLabel = "Back",
  children,
}: CreatePageShellProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-sky-100/80 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.28),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,1),rgba(240,249,255,0.96),rgba(248,250,252,1))] shadow-[0_28px_80px_-40px_rgba(14,165,233,0.35)]">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            
            <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900">
              {title}
            </CardTitle>

            <Button
              asChild
              className="h-11 rounded-xl border border-sky-200 bg-white/90 px-5 text-sky-700 shadow-[0_14px_36px_-24px_rgba(14,165,233,0.55)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.5)]"
            >
              <Link href={backHref}>
                <ArrowLeft className="size-4" />
                {backLabel}
              </Link>
            </Button>

          </div>
        </CardHeader>
      </Card>

      <Card className="border-sky-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,252,255,0.98))] shadow-[0_30px_90px_-48px_rgba(15,23,42,0.32)]">
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  );
}