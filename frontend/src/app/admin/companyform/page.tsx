"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const companySchema = z.object({
  companyName: z.string().min(1, { message: "Company name is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  gstNumber: z.string()
    .min(15, { message: "GST number must be 15 characters" })
    .max(15, { message: "GST number must be 15 characters" })
    .optional(),
  industries: z.string().min(1, { message: "Industries is required" }),
  website: z.string()
    .url({ message: "Invalid website URL" })
    .or(z.literal(""))
    .optional(),
  industriesType: z.string().optional(),
  flag: z.enum(["Red", "Yellow", "Green", ""]).optional(),
});

export default function AddCategory() {
    const searchParams = useSearchParams();
    const certificateId = searchParams.get('id');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof companySchema>>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            companyName: "",
            address: "",
            gstNumber: "",
            industries: "",
            website: "",
            industriesType: "",
            flag: "",
        },
    });

    useEffect(() => {
        if (certificateId) {
            const fetchCompany = async () => {
                try {
                    setIsSubmitting(true);
                    const response = await axios.get(`http://localhost:5000/api/v1/company/getcompanyById/${certificateId}`);
                    if (response.data) {
                        form.reset({
                            companyName: response.data.companyName || "",
                            address: response.data.address || "",
                            gstNumber: response.data.gstNumber || "",
                            industries: response.data.industries || "",
                            website: response.data.website || "",
                            industriesType: response.data.industriesType || "",
                            flag: response.data.flag || "",
                        });
                    }
                } catch (error) {
                    toast({
                        title: "Error",
                        description: "Failed to fetch company details",
                        variant: "destructive",
                    });
                    console.error("Fetch error:", error);
                } finally {
                    setIsSubmitting(false);
                }
            };
            fetchCompany();
        }
    }, [certificateId, form]);

    const onSubmit = async (values: z.infer<typeof companySchema>) => {
        setIsSubmitting(true);

        try {
            let response;
            if (certificateId) {
                response = await axios.put(`http://localhost:5000/api/v1/company/updatecompany/${certificateId}`, values);
                toast({
                    title: "Success",
                    description: "Company updated successfully!",
                });
            } else {
                response = await axios.post("http://localhost:5000/api/v1/company/createcompany", values);
                toast({
                    title: "Success",
                    description: "Company created successfully!",
                });
                form.reset();
            }
        } catch (error) {
            let errorMessage = "An unknown error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.message || "Failed to process request";
            }
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <ModeToggle />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/dashboard">
                                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/companyrecord">
                                        Company Record
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
                    <Card className="max-w-6xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center">
                                {certificateId ? "Update Company" : "Create Company"}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {certificateId
                                    ? "Modify the company details below"
                                    : "Fill out the form below to create a new company"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Company name" 
                                                            {...field} 
                                                            disabled={isSubmitting}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Address" 
                                                            {...field} 
                                                            disabled={isSubmitting}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="industries"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Industries" 
                                                            {...field} 
                                                            disabled={isSubmitting}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="website"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Website URL" 
                                                            {...field} 
                                                            disabled={isSubmitting}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="industriesType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Industries Type" 
                                                            {...field} 
                                                            disabled={isSubmitting}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gstNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="15-character GST number" 
                                                            {...field} 
                                                            disabled={isSubmitting}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="flag"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="">Select Flag</option>
                                                            <option value="Red">Red</option>
                                                            <option value="Yellow">Yellow</option>
                                                            <option value="Green">Green</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" />
                                                {certificateId ? "Updating..." : "Creating..."}
                                            </>
                                        ) : certificateId ? "Update" : "Create"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}