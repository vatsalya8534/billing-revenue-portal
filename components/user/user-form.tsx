"use client";

import React from "react";
import { useForm, SubmitHandler, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowRight } from "lucide-react";

import { z } from "zod";
import { Status } from "@prisma/client";
import { userSchema } from "@/lib/validators";

import { createUser } from "@/lib/actions/users";

export type UserFormType = z.infer<typeof userSchema>;

interface UserFormProps {
  data?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    status: Status;
    roleId?: number;
    remark?: string;
  };
  roles: { id: number }[];
  update?: boolean;

  updateUserAction?: (id: number, data: {
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    roleId?: number;
    status?: Status;
    remark?: string;
  }) => Promise<any>;
}

const UserForm: React.FC<UserFormProps> = ({ data, roles, update = false }) => {
  const router = useRouter();

  const form = useForm<UserFormType>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: data?.username ?? "",
      password: "",
      firstName: data?.firstName ?? "",
      lastName: data?.lastName ?? "",
      status: data?.status ?? Status.ACTIVE,
      roleId: data?.roleId ?? 0,
      remark: data?.remark ?? "",
    },
  });

  const [isPending, setIsPending] = React.useState(false);

  const onSubmit: SubmitHandler<UserFormType> = async (values) => {
    setIsPending(true);
    try {
      if (update && data?.id) {
        const res = await fetch(`/api/users/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: values.username,
            password: values.password || undefined,
            firstName: values.firstName,
            lastName: values.lastName,
            roleId: Number(values.roleId),
            status: values.status,
            remark: values.remark,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update user");
        }

        toast.success("User updated successfully");
      } else {
        await createUser({
          username: values.username,
          password: values.password ?? "",
          firstName: values.firstName,
          lastName: values.lastName,
          roleId: Number(values.roleId),
          status: values.status,
          remark: values.remark,
          createdBy: "admin",
        });
        toast.success("User created successfully");
      }

      router.push("/admin/users");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save user");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }: { field: ControllerRenderProps<UserFormType, "username"> }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password (only if not updating) */}
          {!update && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: ControllerRenderProps<UserFormType, "password"> }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }: { field: ControllerRenderProps<UserFormType, "firstName"> }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }: { field: ControllerRenderProps<UserFormType, "lastName"> }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Id */}
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }: { field: ControllerRenderProps<UserFormType, "roleId"> }) => (
              <FormItem>
                <FormLabel>Role Id</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter role ID"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: ControllerRenderProps<UserFormType, "status"> }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select {...field} className="border rounded px-3 py-2 w-full">
                    <option value={Status.ACTIVE}>Active</option>
                    <option value={Status.INACTIVE}>Inactive</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Remark */}
        <FormField
          control={form.control}
          name="remark"
          render={({ field }: { field: ControllerRenderProps<UserFormType, "remark"> }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes" className="h-32" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {update ? "Update User" : "Save User"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserForm;

