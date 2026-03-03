"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { APP_NAME } from "@/lib/constants"
import Image from "next/image"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useActionState, useEffect, useState } from "react"
import { loginFormUser } from "@/lib/actions/users";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  let [data, action] = useActionState(loginFormUser, {
    success: false,
    message: ''
  })

  console.log(data);
  

  const [mounted, setMounted] = useState<Boolean>(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (mounted)
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-1">
            <form className="p-6 md:p-8" action={action}>

              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">
                        Billing Software
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your {APP_NAME}
                  </p>
                </div>
                {data && !data.success && <p className="text-center text-destructive my-2">{data.message}</p>}
                <Field>
                  <FieldLabel htmlFor="username">username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input id="password" name="password" type="password" required />
                </Field>
                <Field>
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Login</Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
}