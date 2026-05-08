import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { themedSectionClassName, themedTabsListClassName } from "./form-theme";

type FormHydrationFallbackProps = {
  fields?: number;
  sections?: number;
  hasTextarea?: boolean;
  hasTabs?: boolean;
  submitWidthClassName?: string;
};

export function FormHydrationFallback({
  fields = 6,
  sections = 2,
  hasTextarea = true,
  hasTabs = false,
  submitWidthClassName = "w-40",
}: FormHydrationFallbackProps) {
  return (
    <div className="space-y-6">
      {hasTabs ? (
        <div className={themedTabsListClassName}>
          <Skeleton className="h-11 flex-1 rounded-xl md:w-32" />
          <Skeleton className="h-11 flex-1 rounded-xl md:w-36" />
        </div>
      ) : null}

      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className={cn(themedSectionClassName, "grid grid-cols-1 gap-6 md:grid-cols-2")}
        >
          {Array.from({ length: fields }).map((__, fieldIndex) => (
            <div key={fieldIndex} className="space-y-2.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}

          {hasTextarea && sectionIndex === sections - 1 ? (
            <div className="space-y-2.5 md:col-span-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : null}
        </div>
      ))}

      <Skeleton className={cn("h-11 rounded-xl", submitWidthClassName)} />
    </div>
  );
}
