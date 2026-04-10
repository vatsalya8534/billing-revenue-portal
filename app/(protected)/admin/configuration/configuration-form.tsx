"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useForm } from "react-hook-form";
import { Configuration } from "@/types";
import { configurationSchema } from "@/lib/validators";
import { toast } from "sonner";
import React from "react";
import { createOrUpdateConfiguration } from "@/lib/actions/configuration";
import { useRouter } from "next/navigation"
import Image from "next/image";

const ConfigurationForm = ({ data }: {
    data?: Configuration
}) => {

    const router = useRouter()

    const form = useForm<Configuration>({
        resolver: zodResolver(configurationSchema),
        defaultValues: data || {
            name: "",
            logo: "",
            favicon: "",
            email: "",
            password: ""
        },
    })

    const [isPending, startTransition] = React.useTransition()

    const uploadImage = async (file: File) => {

        try {
            const formData = new FormData();
            formData.append("image", file);

            const fileUploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await fileUploadRes.json();

            return data;
        } catch (error: any) {
            return {
                success: false,
                message: error.message
            }
        }

    }


    function onSubmit(values: Configuration) {
        startTransition(async () => {
            let res;

            let imageRes = await uploadImage(values.logo as File)

            if (imageRes?.success) values.logo = imageRes.url

            imageRes = values.logo as File && await uploadImage(values.favicon as File)

            if (imageRes?.success) values.favicon = imageRes.url

            res = values.favicon as File && await createOrUpdateConfiguration(values, data?.id as string)

            if (!res?.success) {
                toast.error("Error", {
                    description: res?.message
                })
            } else {
                toast.success("Success", {
                    description: res?.message
                })

                router.refresh()
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-semibold">Configuration</h1>
                </div>
            </CardHeader>

            <CardContent className="w-full">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <Accordion type="multiple" className="w-full" defaultValue={["general", "email"]}>
                            <AccordionItem value="general">
                                <AccordionTrigger>General</AccordionTrigger>
                                <AccordionContent className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter project name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="logo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Logo</FormLabel>
                                                <FormControl>
                                                    <Input type="file" onChange={(e) => {
                                                        field.onChange(e.target.files?.[0]);
                                                    }} />
                                                </FormControl>
                                                {
                                                    data?.logo && <div className="mt-4">
                                                        <Image src={data?.logo as string} height={100} width={100} alt="" />
                                                    </div>
                                                }

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="favicon"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Favicon</FormLabel>
                                                <FormControl>
                                                    <Input type="file" onChange={(e) => {
                                                        field.onChange(e.target.files?.[0]);
                                                    }} />
                                                </FormControl>
                                                 {
                                                    data?.favicon && <div className="mt-4">
                                                        <Image src={data?.favicon as string} height={100} width={100} alt="" />
                                                    </div>
                                                }
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="email">
                                <AccordionTrigger>Email</AccordionTrigger>
                                <AccordionContent className="space-y-8 mt-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Button type="submit">Submit</Button>

                    </form>
                </Form>
            </CardContent >
        </Card >
    );
};

export default ConfigurationForm;