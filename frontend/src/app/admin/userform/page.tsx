"use client";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { Separator } from "@/components/ui/separator";

import { Eye, EyeOff } from "react-feather";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useRouter } from "next/navigation"

const registerSchema = z
  .object({
    name: z.string().nonempty("Required"),
    contact: z.string()
      .regex(/^\d*$/, { message: "Contact number must be numeric" })
      .nonempty({ message: "Required" }),
    email: z.string().email({ message: "Required" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);
    setServerError(""); // you can still keep this if you want field-level error too

    try {
      const response = await fetch("http://localhost:5000/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Registration failed",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
        setServerError(data.message || "Something went wrong.");
      } else {
        toast({
          title: "User Submitted",
          description: "The user has been successfully created",
        });
        form.reset();
        router.push("/admin/userrecord");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
      setServerError("An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger />
          <ModeToggle />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/userrecord">User Record</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="container mx-auto py-10 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Create User</CardTitle>
              <CardDescription className="text-center">
                Fill out the form below to create a new user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleRegister)}
                  className="grid gap-4"
                >
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="User Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Contact Number"
                            {...field}
                            disabled={isSubmitting}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, '');
                              field.onChange(numericValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="email" placeholder="Email Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm Password"
                              {...field}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {serverError && (
                    <p className="text-red-500 text-sm">{serverError}</p>
                  )}

                  <CardFooter className="px-0">
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Registering..." : "Create"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}