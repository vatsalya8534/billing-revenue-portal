"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useActionState, useEffect, useState } from "react"
import { loginFormUser } from "@/lib/actions/users";

export function LoginForm({
  companyName,
  className,
  ...props
}: React.ComponentProps<"div"> & { companyName?: string }) {
  let [data, action] = useActionState(loginFormUser, {
    success: false,
    message: ''
  })  

  const [mounted, setMounted] = useState<Boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (mounted)
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden border-slate-200/80 bg-white/90 p-0 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
          <CardContent className="grid p-0 md:grid-cols-1">
            <form className="p-6 md:p-8" action={action}>

              <FieldGroup className="gap-5">
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {companyName || "Billing Software"}
                  </h1>
                  <p className="text-sm leading-6 text-slate-500">
                    Login to continue securely into your finance workspace.
                  </p>
                </div>

                {data && !data.success && (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                    {data.message}
                  </p>
                )}

                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    required
                    className="h-11 rounded-xl border-slate-200"
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-11 rounded-xl border-slate-200"
                  />
                </Field>
                <Field>
                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-[#1d4ed8] text-white shadow-md hover:bg-[#1e40af]"
                  >
                    Sign In
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
}
