"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

interface ContactPerson {
  firstName: string;
  middleName: string;
  lastName: string;
  contactNo: string;
  email: string;
  designation: string;
}

export default function Customer() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get("id"); 
  
  const [formData, setFormData] = useState<ContactPerson>({
    firstName: "",
    middleName: "",
    lastName: "",
    contactNo: "",
    email: "",
    designation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null); // For debugging

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch existing contact data for editing - IMPROVED VERSION
  useEffect(() => {
    if (contactId) {
      const fetchContact = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:5000/api/v1/contactperson/getContactPersonByid/${contactId}`);
          
          // Debug: Log the full API response
          console.log("API Response:", response.data);
          setApiResponse(response.data);
          
          // Handle both direct and nested response structures
          const contactData = response.data.data || response.data;
          
          if (contactData) {
            setFormData({
              firstName: contactData.firstName || "",
              middleName: contactData.middleName || "",
              lastName: contactData.lastName || "",
              contactNo: contactData.contactNo || contactData.phone || "",
              email: contactData.email || "",
              designation: contactData.designation || contactData.position || "" 
            });
          }
          setLoading(false);
        } catch (error: any) {
          setLoading(false);
          setError(error.response?.data?.message || "Failed to fetch contact details");
          console.error("Fetch error:", error);
        }
      };
      fetchContact();
    }
  }, [contactId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (contactId) {
        await axios.put(`http://localhost:5000/api/v1/contactperson/updateContactPerson/${contactId}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/v1/contactperson/generateContactPerson", formData);
      }
      setSuccess(true);
      if (!contactId) {
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          contactNo: "",
          email: "",
          designation: "",
        });
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.error || err.message || "Failed to submit contact details");
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
                  <BreadcrumbLink href="admincustomer">Admin Contact</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="admincontacttable">Contact Details Table</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        {/* Debug Panel - Shows API response and current form data */}
        
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">
                {contactId ? "Edit Contact Person" : "Add Contact Person"}
              </CardTitle>
              <CardDescription className="text-center">
                {contactId ? "Modify contact details" : "Add new contact person"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                  
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="w-full p-2 border rounded"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                  
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Middle Name"
                      className="w-full p-2 border rounded"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                  
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="w-full p-2 border rounded"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                
                    <input
                      type="tel"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleChange}
                      placeholder="Contact Number"
                      className="w-full p-2 border rounded"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                  
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full p-2 border rounded"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                  
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Designation"
                      className="w-full p-2 border rounded"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && <div className="text-red-500 text-center">{error}</div>}
                {success && <div className="text-green-500 text-center">
                  Contact {contactId ? "updated" : "added"} successfully!
                </div>}

                <CardFooter className="px-0">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : contactId ? "Update Contact" : "Add Contact"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}