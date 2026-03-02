"use client";

import React from "react";
import { z } from "zod";
import { useForm, SubmitHandler, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight } from "lucide-react";

import { roleSchema } from "@/lib/validators";
import { roleDefaultValues } from "@/lib/constants";
import { createRole, updateRole } from "@/lib/actions/role";
import { Role } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type RoleFormType = z.infer<typeof roleSchema>;

const RoleForm = ({
  data,
  update = false,
}: {
  data?: Role;
  update: boolean;
}) => {
  const router = useRouter();
  const id = data?.id;

  const form = useForm<RoleFormType>({
    resolver: zodResolver(roleSchema),
    defaultValues: data
      ? {
          roleName: data.roleName,
          createdBy: data.createdBy,
          remark: data.remark ?? "",
        }
      : roleDefaultValues,
  });

  const [isPending, startTransition] = React.useTransition();

  const onSubmit: SubmitHandler<RoleFormType> = (values) => {
    startTransition(async () => {
      try {
        if (update && id) {
          await updateRole(id, values);
        } else {
          await createRole(values);
        }

        toast.success("Role saved successfully");
        router.push("/admin/roles");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Role Name */}
          <FormField
            control={form.control}
            name="roleName"
            render={({ field }: { field: ControllerRenderProps<RoleFormType, "roleName"> }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter role name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Created By */}
          <FormField
            control={form.control}
            name="createdBy"
            render={({ field }: { field: ControllerRenderProps<RoleFormType, "createdBy"> }) => (
              <FormItem>
                <FormLabel>Created By</FormLabel>
                <FormControl>
                  <Input placeholder="Enter creator name" {...field} />
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
          render={({ field }: { field: ControllerRenderProps<RoleFormType, "remark"> }) => (
            <FormItem>
              <FormLabel>Remark</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes about this role"
                  className="h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            Save Role
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;