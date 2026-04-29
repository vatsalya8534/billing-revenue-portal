import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const themedFieldClassName = "space-y-2.5";
export const themedLabelClassName =
  "text-[0.95rem] font-medium text-slate-700 transition-colors duration-200";
export const themedInputClassName =
  "h-11 rounded-xl border-sky-200/90 bg-white/95 shadow-[0_14px_34px_-24px_rgba(14,165,233,0.5)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.42)] focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-100";
export const themedSelectTriggerClassName =
  "h-11 w-full rounded-xl border-sky-200/90 bg-white/95 shadow-[0_14px_34px_-24px_rgba(14,165,233,0.5)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.42)] focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
export const themedTextareaClassName =
  "min-h-[120px] rounded-2xl border-sky-200/90 bg-white/95 shadow-[0_14px_34px_-24px_rgba(14,165,233,0.5)] transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/40 hover:shadow-[0_18px_42px_-22px_rgba(14,165,233,0.42)] focus-visible:border-sky-400 focus-visible:ring-4 focus-visible:ring-sky-100";
export const themedSectionClassName =
  "overflow-hidden rounded-3xl border border-sky-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,252,255,0.96))] p-6 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.24)]";
export const themedSectionHeaderClassName = "mb-6 space-y-2";
export const themedSectionTitleClassName =
  "text-lg font-semibold tracking-tight text-slate-900";
export const themedSectionDescriptionClassName =
  "text-sm leading-6 text-slate-600";
export const themedTabsListClassName =
  "grid h-auto w-full grid-cols-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-1 md:w-fit";
export const themedTabTriggerClassName =
  "rounded-xl px-5 py-2.5 font-medium text-slate-600 transition-all duration-200 hover:text-sky-700 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-[0_12px_28px_-18px_rgba(14,165,233,0.45)]";
export const themedSubmitButtonClassName =
  "h-11 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 px-6 text-white shadow-[0_18px_42px_-18px_rgba(14,165,233,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:from-sky-600 hover:via-sky-700 hover:to-cyan-600 hover:shadow-[0_22px_48px_-16px_rgba(14,165,233,0.62)]";
export const themedCheckboxClassName =
  "size-4 rounded border-sky-300 text-sky-600 focus:ring-2 focus:ring-sky-200";

type ThemedFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function ThemedFormSection({
  title,
  description,
  children,
  className,
}: ThemedFormSectionProps) {
  return (
    <section className={cn(themedSectionClassName, className)}>
      <div className={themedSectionHeaderClassName}>
        <h2 className={themedSectionTitleClassName}>{title}</h2>
        {description ? (
          <p className={themedSectionDescriptionClassName}>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
