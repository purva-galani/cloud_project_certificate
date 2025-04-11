"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast'
import { AdminSidebar } from "@/components/admin-sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import router from "next/router";

interface Observation {
    gas: string;
    before: string;
    after: string;
}

interface CertificateRequest {
    certificateNo: string;
    customerName: string;
    siteLocation: string;
    makeModel: string;
    range: string;
    serialNo: string;
    calibrationGas: string;
    gasCanisterDetails: string;
    dateOfCalibration: string;
    calibrationDueDate: string;
    observations: Observation[];
    engineerName: string;
    status: string;
}

interface CertificateResponse {
    certificateId: string;
    message: string;
    downloadUrl: string;
}

interface Model {
    model_name: string;
    range: string;
}

interface Engineer {
    id: string;
    name: string;
}

export default function AddCategory() {
    const searchParams = useSearchParams();
    const certificateId = searchParams.get('id');

    const [formData, setFormData] = useState<CertificateRequest>({
        certificateNo: "",
        customerName: "",
        siteLocation: "",
        makeModel: "",
        range: "",
        serialNo: "",
        calibrationGas: "",
        gasCanisterDetails: "",
        dateOfCalibration: new Date().toISOString().split('T')[0],
        calibrationDueDate: new Date().toISOString().split('T')[0],
        observations: [{ gas: "", before: "", after: "" }],
        engineerName: "",
        status: ""
    });

    const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [timePeriod, setTimePeriod] = useState<number | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(true);
    const [engineers, setEngineers] = useState<Engineer[]>([]);
    const [isLoadingEngineers, setIsLoadingEngineers] = useState(true);
    const [engineerError, setEngineerError] = useState<string | null>(null);


    // Fetch models and engineers
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/v1/addcategory/getCategories');
                const data = await response.json();
                setModels(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setError("Failed to load models. Using default options.");
            } finally {
                setIsLoadingModels(false);
            }
        };

        const fetchEngineers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/v1/engineers/getEngineers");
                const data = await response.json();
                setEngineers(data);
            } catch (error) {
                console.error("Error fetching engineers:", error);
                setEngineerError("Failed to load engineers.");
            } finally {
                setIsLoadingEngineers(false);
            }
        };

        fetchCategories();
        fetchEngineers();
    }, []);

    useEffect(() => {
        console.log("Current formData:", formData);
    }, [formData]);


    useEffect(() => {
        const fetchCertificateData = async () => {
            const today = new Date().toISOString().split('T')[0];

            if (!certificateId) {
                setFormData({
                    certificateNo: "",
                    customerName: "",
                    siteLocation: "",
                    makeModel: "",
                    range: "",
                    serialNo: "",
                    calibrationGas: "",
                    gasCanisterDetails: "",
                    dateOfCalibration: today,
                    calibrationDueDate: today,
                    observations: [{ gas: "", before: "", after: "" }],
                    engineerName: "",
                    status: ""
                });
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(
                    `http://localhost:5000/api/v1/certificates/getCertificateById/${certificateId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                console.log("Full API Response:", response);

                if (!response.data.success) {
                    throw new Error(response.data.message || "Failed to fetch certificate");
                }

                const certificateData = response.data.data;

                // Transform API data to match form structure
                const transformedData = {
                    certificateNo: certificateData.certificateNo || "",
                    customerName: certificateData.customerName ||
                        (certificateData.customer?.customerName || ""),
                    siteLocation: certificateData.siteLocation || "",
                    makeModel: certificateData.makeModel || "",
                    range: certificateData.range || "",
                    serialNo: certificateData.serialNo || "",
                    calibrationGas: certificateData.calibrationGas || "",
                    gasCanisterDetails: certificateData.gasCanisterDetails || "",
                    dateOfCalibration: certificateData.dateOfCalibration?.split('T')[0] || today,
                    calibrationDueDate: certificateData.calibrationDueDate?.split('T')[0] || today,
                    observations: Array.isArray(certificateData.observations)
                        ? certificateData.observations.map((obs: any) => ({
                            gas: obs.gas || "",
                            before: obs.before || "",
                            after: obs.after || ""
                        }))
                        : [{ gas: "", before: "", after: "" }],
                    engineerName: certificateData.engineerName || "",
                    status: certificateData.status || ""
                };

                console.log("Transformed Data:", transformedData);
                setFormData(transformedData);
                setStartDate(transformedData.dateOfCalibration);
                setEndDate(transformedData.calibrationDueDate);

            } catch (error) {
            let errorMessage = "An unknown error occurred";
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data?.message || "Failed to load certificate data";
            }
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
            console.error("Error fetching certificate:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificateData();
    }, [certificateId]);

    // Date handling functions
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        setFormData(prev => ({
            ...prev,
            dateOfCalibration: newStartDate
        }));

        if (timePeriod) {
            const startDateObj = new Date(newStartDate);
            startDateObj.setMonth(startDateObj.getMonth() + timePeriod);
            const newEndDate = startDateObj.toISOString().split("T")[0];
            setEndDate(newEndDate);
            setFormData(prev => ({
                ...prev,
                calibrationDueDate: newEndDate
            }));
        }
    };

    const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const period = Number(e.target.value);
        setTimePeriod(period);

        if (startDate) {
            const startDateObj = new Date(startDate);
            startDateObj.setMonth(startDateObj.getMonth() + period);
            const newEndDate = startDateObj.toISOString().split("T")[0];
            setEndDate(newEndDate);
            setFormData(prev => ({
                ...prev,
                calibrationDueDate: newEndDate
            }));
        }
    };

    // Form field handlers
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        let updatedObservations = formData.observations;
        let updatedRange = formData.range;

        if (name === "makeModel") {
            const selectedModel = models.find(m => m.model_name === value);
            updatedRange = selectedModel ? selectedModel.range : "";

            switch (value) {
                case "GMIleakSurveyor":
                    updatedObservations = Array(3).fill({ gas: "", before: "", after: "" });
                    break;
                case "GMIGT41Series":
                    updatedObservations = Array(4).fill({ gas: "", before: "", after: "" });
                    break;
                case "GMIGT44":
                    updatedObservations = Array(3).fill({ gas: "", before: "", after: "" });
                    break;
                default:
                    updatedObservations = [{ gas: "", before: "", after: "" }];
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === "makeModel" && { range: updatedRange, observations: updatedObservations })
        }));
    };

    const handleObservationChange = (index: number, field: keyof Observation, value: string) => {
        const updatedObservations = [...formData.observations];
        updatedObservations[index] = { ...updatedObservations[index], [field]: value };
        setFormData({ ...formData, observations: updatedObservations });
    };

    const addObservation = () => {
        if (formData.observations.length < 5) {
            setFormData({
                ...formData,
                observations: [...formData.observations, { gas: "", before: "", after: "" }]
            });
        }
    };

    const removeObservation = (index: number) => {
        const updatedObservations = [...formData.observations];
        updatedObservations.splice(index, 1);
        setFormData({ ...formData, observations: updatedObservations });
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Determine the URL and method (POST for new, PUT for update)
            const url = certificateId
                ? `http://localhost:5000/api/v1/certificates/updateCertificate/${certificateId}`
                : "http://localhost:5000/api/v1/certificates/generateCertificate";
            const method = certificateId ? 'put' : 'post';

            // Prepare the submission data
            const submissionData = {
                ...formData,
                dateOfCalibration: startDate,
                calibrationDueDate: endDate,
                engineerName: formData.engineerName.trim(),
            };

            const requiredFields = {

                customerName: "Customer Name",
                siteLocation: "Site Location",
                makeModel: "Make/Model",
                range: "Range",
                serialNo: "Serial No",
                calibrationGas: "Calibration Gas",
                gasCanisterDetails: "Gas Canister Details",
                dateOfCalibration: "Date of Calibration",
                calibrationDueDate: "Calibration Due Date",
                engineerName: "Engineer Name",
                status: "Status"
            };

            const emptyFields = Object.entries(requiredFields)
                .filter(([key]) => !formData[key as keyof CertificateRequest]?.toString().trim())
                .map(([_, label]) => label);

            if (emptyFields.length > 0) {
                setError(`Please fill in: ${emptyFields.join(", ")}`);
                setLoading(false);
                return;
            }

            // Check observations
            const hasEmptyObservations = formData.observations.some(obs =>
                !obs.gas.trim() || !obs.before.trim() || !obs.after.trim()
            );

            if (hasEmptyObservations) {
                setError("Please fill in all observation fields");
                setLoading(false);
                return;
            }
            const response = await axios[method](
                url,
                submissionData,
                { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }
            );

            setCertificate(response.data);

            toast({
                title: "Success",
                description: certificateId ? "Certificate updated successfully!" : "Certificate generated successfully!",
                variant: "default",
            });

            if (certificateId) {
                router.push("/certificates");
            }
        } catch (err: any) {
            console.error("Submission error:", err);
            setError(err.response?.data?.error || "An error occurred");
            toast({
                title: "Error",
                description: err.response?.data?.error || "An error occurred",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // PDF download handler
    const handleDownload = async () => {
        if (!certificate?.downloadUrl) return;

        try {
            const response = await axios.get(
                `http://localhost:5000${certificate.downloadUrl}`,
                {
                    responseType: 'blob',
                    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate-${certificate.certificateId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error:", err);
            setError("Failed to download certificate. Please try again.");
            toast({
                title: "Error",
                description: "Failed to download certificate",
                variant: "destructive",
            });
        }
    };

    // Loading state
    if (loading && certificateId) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                <span className="ml-4">Loading certificate data...</span>
            </div>
        );
    }

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
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/certificaterecord">
                                        Certificate Record
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
                                {certificateId ? "Update Certificate" : "Create Certificate"}
                            </CardTitle>
                            <CardDescription className="text-center">
                                {certificateId
                                    ? "Modify the certificate details below"
                                    : "Fill out the form below to create a new certificate"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                        <span className="block sm:inline">{error}</span>
                                    </div>
                                )}
                                {loading && (
                                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
                                        <span className="block sm:inline">{certificateId ? "Updating..." : "Generating..."}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        name="customerName"
                                        placeholder="Enter Name"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        className="p-2 border rounded"

                                    />
                                    <input
                                        type="text"
                                        name="siteLocation"
                                        placeholder="Enter Site Location"
                                        value={formData.siteLocation}
                                        onChange={handleChange}
                                        className="p-2 border rounded"

                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <select
                                        name="makeModel"
                                        value={formData.makeModel}
                                        onChange={handleChange}
                                        className="p-2 border rounded"

                                        disabled={isLoadingModels}
                                    >
                                        <option value="">Select Make and Model</option>
                                        {isLoadingModels ? (
                                            <option value="" disabled>Loading models...</option>
                                        ) : models.length > 0 ? (
                                            models.map((model) => (
                                                <option key={model.model_name} value={model.model_name}>
                                                    {model.model_name}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="GMIleakSurveyor">GMI leak Surveyor</option>
                                                <option value="GMIGT41Series">GMI GT 41 Series</option>
                                                <option value="GMIGT44">GMI GT 44</option>
                                            </>
                                        )}
                                    </select>
                                    <input
                                        type="text"
                                        name="range"
                                        placeholder="Range"
                                        value={formData.range}
                                        onChange={handleChange}
                                        className="p-2 border rounded"
                                        disabled
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="text"
                                        name="serialNo"
                                        placeholder="Enter Serial Number"
                                        value={formData.serialNo}
                                        onChange={handleChange}
                                        className="p-2 border rounded"

                                    />
                                    <input
                                        type="text"
                                        name="calibrationGas"
                                        placeholder="Enter Calibration Gas"
                                        value={formData.calibrationGas}
                                        onChange={handleChange}
                                        className="p-2 border rounded"

                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <textarea
                                        name="gasCanisterDetails"
                                        placeholder="Enter Gas Canister Details"
                                        value={formData.gasCanisterDetails}
                                        onChange={handleChange}
                                        className="p-2 border rounded"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="date"
                                        name="dateOfCalibration"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                        className="p-2 border rounded"

                                    />
                                    <select
                                        onChange={handleTimePeriodChange}
                                        className="border p-2 rounded-md"

                                    >
                                        <option value="">Select Period</option>
                                        <option value="3">3 Months</option>
                                        <option value="6">6 Months</option>
                                        <option value="9">9 Months</option>
                                        <option value="12">12 Months</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <input
                                        type="date"
                                        name="calibrationDueDate"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setFormData(prev => ({
                                                ...prev,
                                                calibrationDueDate: e.target.value
                                            }));
                                        }}
                                        className="p-2 border rounded"
                                        disabled={timePeriod !== null}

                                    />
                                    <select
                                        name="engineerName"
                                        value={formData.engineerName}
                                        onChange={handleChange}
                                        className="p-2 border rounded"

                                        disabled={isLoadingEngineers}
                                    >
                                        <option value="">Select Engineer Name</option>
                                        {isLoadingEngineers ? (
                                            <option>Loading engineers...</option>
                                        ) : engineerError ? (
                                            <option>Error loading engineers</option>
                                        ) : (
                                            engineers.map((engineer, index) => (
                                                <option key={engineer.id || index} value={engineer.name}>
                                                    {engineer.name}
                                                </option>
                                            ))
                                        )}
                                    </select>


                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="p-2 border rounded"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Checked">Checked</option>
                                        <option value="Unchecked">Unchecked</option>
                                    </select>
                                </div>

                                <h2 className="text-lg font-bold mt-4">Observation Table</h2>
                                <div className="flex justify-end mb-4">
                                    <button
                                        type="button"
                                        onClick={addObservation}
                                        className="bg-black text-white px-4 py-2 border rounded hover:bg-gray-900"
                                        disabled={formData.observations.length >= 5}
                                    >
                                        Add Observation
                                    </button>
                                </div>
                                <table className="table-auto border-collapse border border-gray-500 rounded w-full">
                                    <thead>
                                        <tr>
                                            <th className="border p-2">#</th>
                                            <th className="border p-2">Gas</th>
                                            <th className="border p-2">Before Calibration</th>
                                            <th className="border p-2">After Calibration</th>
                                            <th className="border p-2">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.observations.map((observation, index) => (
                                            <tr key={index}>
                                                <td className="border p-2">{index + 1}</td>
                                                <td className="border p-2">
                                                    <input
                                                        type="text"
                                                        name="gas"
                                                        value={observation.gas}
                                                        onChange={(e) => handleObservationChange(index, 'gas', e.target.value)}
                                                        className="w-full p-1 border rounded"

                                                    />
                                                </td>
                                                <td className="border p-2">
                                                    <input
                                                        type="text"
                                                        name="before"
                                                        value={observation.before}
                                                        onChange={(e) => handleObservationChange(index, 'before', e.target.value)}
                                                        className="w-full p-1 border rounded"

                                                    />
                                                </td>
                                                <td className="border p-2">
                                                    <input
                                                        type="text"
                                                        name="after"
                                                        value={observation.after}
                                                        onChange={(e) => handleObservationChange(index, 'after', e.target.value)}
                                                        className="w-full p-1 border rounded"

                                                    />
                                                </td>
                                                <td className="border p-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeObservation(index)}
                                                        className="bg-black text-white px-2 py-1 border rounded hover:bg-red-950"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {formData.observations.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="border p-2 text-center text-gray-500">
                                                    No observations added yet. Click "Add Observation" to add one.
                                                </td>
                                            </tr>
                                        )}
                                        {formData.observations.length >= 5 && (
                                            <tr>
                                                <td colSpan={5} className="border p-2 text-center text-yellow-600">
                                                    Maximum limit of 5 observations reached.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <button
                                    type="submit"
                                    className="bg-blue-950 hover:bg-blue-900 text-white p-2 rounded-md w-full"
                                    disabled={loading}
                                >
                                    {loading ? "Generating..." : "Create"}
                                </button>
                            </form>

                            {certificate && (
                                <div className="mt-4 text-center">
                                    <p className="text-green-600 mb-2">{certificate.message}</p>
                                    <Button
                                        className="w-5 h-10 text-sm"
                                        onClick={handleDownload}
                                        disabled={loading}
                                    >
                                        {loading ? "Downloading..." : "Download Certificate"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}