"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function AddCategory() {
    const searchParams = useSearchParams();
    const certificateId = searchParams.get('id');

    // State for form fields
    const [formData, setFormData] = useState({
        companyName: "",
        address: "",
        gstNumber: "",  
        industries: "",
        website: "",
        industriesType: "",
        flag: "",
    });

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [success, setSuccess] = useState(false);

    // Function to handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Fetch company details for editing
    useEffect(() => {
        if (certificateId) {
            const fetchCompany = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:5000/api/v1/company/getcompanyById/${certificateId}`);
                    if (response.data) {
                        setFormData({
                            companyName: response.data.companyName || "",
                            address: response.data.address || "",
                            gstNumber: response.data.gstNumber || "",
                            industries: response.data.industries || "",
                            website: response.data.website || "",
                            industriesType: response.data.industriesType || "",
                            flag: response.data.flag || "",
                        });
                    }
                    setLoading(false);
                } catch (error) {
                    setLoading(false);
                    setError("Failed to fetch company details");
                    console.error("Fetch error:", error);
                }
            };
            fetchCompany();
        }
    }, [certificateId]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            let response;
            if (certificateId) {
                // Update company
                response = await axios.put(`http://localhost:5000/api/v1/company/updatecompany/${certificateId}`, formData);
            } else {
                // Create new company
                response = await axios.post("http://localhost:5000/api/v1/company/createcompany", formData);
            }

            setCertificate(response.data);
            setSuccess(true);
            if (!certificateId) {
                // Reset form if creating new company
                setFormData({
                    companyName: "",
                    address: "",
                    gstNumber: "",  
                    industries: "",
                    website: "",
                    industriesType: "",
                    flag: "",
                });
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to process request");
            console.error("Submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="addmodel">
                                        <BreadcrumbPage>Add Model</BreadcrumbPage>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="admincompany">
                                        <BreadcrumbPage>Admin Company Details</BreadcrumbPage>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="companydetailstable">
                                        Admin Company Details Table
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
                                {certificateId ? "Edit Company Details" : "Add Company Details"}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {certificateId
                                    ? "Modify the company details below"
                                    : "Fill out the form below to add a new company"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Company name"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="p-2 border rounded w-full"
                                        required
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="p-2 border rounded w-full"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        name="industries"
                                        placeholder="Industries"
                                        value={formData.industries}
                                        onChange={handleChange}
                                        className="p-2 border rounded w-full"
                                        required
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        name="website"
                                        placeholder="Website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="p-2 border rounded w-full"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        name="industriesType"
                                        placeholder="Industries Type"
                                        value={formData.industriesType}
                                        onChange={handleChange}
                                        className="p-2 border rounded w-full"
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        placeholder="GST Number"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        className="p-2 border rounded w-full"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <select
                                        name="flag"
                                        value={formData.flag}
                                        onChange={handleChange}
                                        className="p-2 border rounded w-full"
                                        disabled={loading}
                                    >
                                        <option value="">Select Flag</option>
                                        <option value="Red">Red</option>
                                        <option value="Yellow">Yellow</option>
                                        <option value="Green">Green</option>
                                    </select>
                                </div>
                                
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : certificateId ? "Update Company" : "Add Company"}
                                </Button>
                            </form>

                            {error && (
                                <p className="mt-4 text-center text-red-500">
                                    {error}
                                </p>
                            )}

                            {success && (
                                <p className="mt-4 text-center text-green-500">
                                    {certificateId ? "Company updated successfully!" : "Company added successfully!"}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}