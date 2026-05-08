import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EditPageShellProps = {
  title: string;
  backHref: string;
  backLabel?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  children: ReactNode;
};

export function EditPageShell({
  title,
  backHref,
  backLabel = "Back",
  eyebrow = "Record",
  icon: Icon = PencilLine,
  children,
}: EditPageShellProps) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-[linear-gradient(135deg,#ffffff,#f8fafc_55%,#fff7ed)] shadow-[0_20px_56px_-42px_rgba(39,39,42,0.45)]">
        <div className="h-1.5 bg-gradient-to-r from-teal-500 via-amber-400 to-rose-500" />
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {eyebrow}
              </p>
              <h1 className="text-2xl font-semibold text-zinc-950 md:text-3xl">
                {title}
              </h1>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-10 rounded-lg border-zinc-300 bg-white text-zinc-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          >
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              {backLabel}
            </Link>
          </Button>
        </div>
      </section>

      <Card className="rounded-xl border-zinc-200 bg-white shadow-[0_18px_42px_-34px_rgba(39,39,42,0.28)]">
        <CardContent className="p-5">{children}</CardContent>
      </Card>
    </div>
  );
}
