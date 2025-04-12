"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { toast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react";

interface Observation {
    gas: string;
    before: string;
    after: string;
}

interface CertificateRequest {
    makeModel: string;
    range: string;
    observations: Observation[];
}

interface Model {
    id: string;
    model_name: string;
    range: string;
}

export default function AddModel() {
    const [formData, setFormData] = useState<CertificateRequest>({
        makeModel: "",
        range: "",
        observations: [],
    });
    const [newModel, setNewModel] = useState<string>("");
    const [newRange, setNewRange] = useState<string>("");
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [engineers, setEngineers] = useState<{ name: string; id: string }[]>([]);
    const [newEngineer, setNewEngineer] = useState<string>("");
    const [selectedEngineer, setSelectedEngineer] = useState<string>("");
    const [serviceEngineers, setServiceEngineers] = useState<{ name: string; id: string }[]>([]);
    const [newServiceEngineer, setNewServiceEngineer] = useState<string>("");
    const [selectedServiceEngineer, setSelectedServiceEngineer] = useState<string>("");


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/v1/addcategory/getCategories');
                const data = await response.json();
                setModels(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchServiceEngineers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/v1/ServiceEngineer/getServiceEngineers");
                const data = await response.json();
                setServiceEngineers(data);
            } catch (error) {
                console.error("Error fetching service engineers:", error);
            }
        };
        fetchServiceEngineers();
    }, []);

    useEffect(() => {
        const fetchEngineers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/v1/engineers/getEngineers");
                const data = await response.json();
                setEngineers(data);
            } catch (error) {
                console.error("Error fetching engineers:", error);
            }
        };
        fetchEngineers();
    }, []);

    const handleAddServiceEngineer = async () => {
        if (newServiceEngineer) {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5000/api/v1/ServiceEngineer/addServiceEngineer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: newServiceEngineer }),
                });

                const contentType = response.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Server did not return JSON");
                }

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || "Failed to add service engineer");
                }

                setServiceEngineers([...serviceEngineers, { name: newServiceEngineer, id: result.id }]);
                setNewServiceEngineer("");
                toast({
                    title: "Add Successful!",
                    description: "Service engineer added successfully!",
                });
                }catch (error) {
                    console.error("Error adding service engineer:", error);
                    toast({
                        title: "Error",
                        description: error instanceof Error ? error.message : "Failed to add service engineer",
                        variant: "destructive",
                    });
                } finally {
                setLoading(false);
            }
        } else {
            toast({
                title: "Warning",
                description: "Please enter a service engineer name",
                variant: "default",
            });        
        }
    };

    const handleAddEngineer = async () => {
        if (newEngineer) {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5000/api/v1/engineers/addEngineer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: newEngineer }),
                });

                const result = await response.json();
                if (response.ok) {
                    setEngineers([...engineers, { name: newEngineer, id: result.id }]);
                    setNewEngineer("");
                    toast({
                        title: "Add Successful!",
                        description: "Engineer added successfully!",
                    })
                } else {
                    alert(result.error);
                }
            } catch (error) {
                console.error("Error adding engineer:", error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to add engineer",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        } else {
            toast({
                title: "Warning",
                description: "Please enter an engineer name",
                variant: "default",
            });       
        }
    };

    const handleNewModelAndRange = async () => {
        if (newModel && newRange) {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:5000/api/v1/addcategory/addnewCategory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model_name: newModel,
                        range: newRange,
                    }),
                });

                const result = await response.json();
                if (response.ok) {
                    setModels([...models, { id: result.id, model_name: newModel, range: newRange }]);
                    setNewModel("");
                    setNewRange("");
                    toast({
                        title: "Success",
                        description: "Model and range added successfully!",
                    });
                    } else {
                    alert(result.error);
                }
            } catch (error) {
                console.error("Error adding category:", error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to add model and range",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        } else {
            toast({
                title: "Warning",
                description: "Please fill both the model and range",
                variant: "default",
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "makeModel") {
            const selectedModel = models.find(model => model.model_name === value);

            if (selectedModel) {
                setFormData(prev => ({
                    ...prev,
                    makeModel: value,
                    range: selectedModel.range,
                }));
            }
        } else {
            const updatedValue = e.target.type === "date"
                ? new Date(e.target.value).toISOString().split("T")[0]
                : value;

            setFormData(prev => ({
                ...prev,
                [name]: updatedValue,
            }));
        }
    };

    const handleDeleteModel = async (id: string) => {

        if (!window.confirm("Are you sure you want to delete this model?")) {
            return;
        }

        setDeleteLoading(id);
        try {
            const response = await fetch(`http://localhost:5000/api/v1/addcategory/deleteCategory/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to delete category");
            }

            setModels(models.filter(model => model.id !== id));

            if (formData.makeModel === models.find(m => m.id === id)?.model_name) {
                setFormData(prev => ({
                    ...prev,
                    makeModel: "",
                    range: ""
                }));
            }

            toast({
                title: "Success",
                description: "Model deleted successfully",
            });        
        } catch (error) {
            console.error("Error deleting category:", error);
            toast({
                title: "Error",
                description: "Error deleting model. Please try again.",
                variant: "destructive",
            });        
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleDeleteEngineer = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this engineer?")) {
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/api/v1/engineers/deleteEngineer/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                throw new Error(result.error || "Failed to delete engineer");
            }
    
            setEngineers(engineers.filter(engineer => engineer.id !== id));
            toast({
                title: "Success",
                description: "Engineer deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting engineer:", error);
            toast({
                title: "Error",
                description: "Error deleting engineer. Please try again.",
                variant: "destructive",
            });
        }
    };
    
    const handleDeleteServiceEngineer = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service engineer?")) {
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/api/v1/ServiceEngineer/deleteServiceEngineer/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                throw new Error(result.error || "Failed to delete service engineer");
            }
    
            setServiceEngineers(serviceEngineers.filter(engineer => engineer.id !== id));
            toast({
                title: "Success",
                description: "Service engineer deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting service engineer:", error);
            toast({
                title: "Error",
                description: "Error deleting service engineer. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Form submitted",
            description: "No backend interaction implemented yet",
        });
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
                                    <BreadcrumbLink href="#">
                                        <BreadcrumbPage>Create Model</BreadcrumbPage>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
                    <Card className="max-w-6xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center">Create Model</CardTitle>
                            <CardDescription className="text-center">
                                Fill out the form below to create a new model
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h2 className="text-lg font-bold mt-4">Add New Model and Range</h2>

                                <div className="mt-2 space-y-2">
                                    {models.map((model) => (
                                        <div key={model.id} className="flex items-center justify-between p-2 border rounded">
                                            <span>{model.model_name} - {model.range}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteModel(model.id)}
                                                className="text-red-500 hover:text-red-700"
                                                disabled={deleteLoading === model.id}
                                            >
                                                {deleteLoading === model.id ? "Deleting..." : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="relative">
                                    <select
                                        name="makeModel"
                                        value={formData.makeModel}
                                        onChange={handleChange}
                                        className="p-2 border rounded w-full"
                                    >
                                        <option value="">Select Make and Model</option>
                                        {models.map((model) => (
                                            <option key={model.id} value={model.model_name}>
                                                {model.model_name}
                                            </option>
                                        ))}
                                    </select>
                                    </div>
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
                                        placeholder="New Model"
                                        value={newModel}
                                        onChange={(e) => setNewModel(e.target.value)}
                                        className="p-2 border rounded"
                                    />
                                    <input
                                        type="text"
                                        placeholder="New Range"
                                        value={newRange}
                                        onChange={(e) => setNewRange(e.target.value)}
                                        className="p-2 border rounded"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleNewModelAndRange}
                                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add New Model and Range'}
                                </button>

                                <h2 className="text-lg font-bold mt-4">Add New Engineer</h2>

                                <div className="mt-2 space-y-2">
                                    {engineers.map((engineer) => (
                                        <div key={engineer.id} className="flex items-center justify-between p-2 border rounded">
                                            <span>{engineer.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEngineer(engineer.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <select
                                        name="selectedEngineer"
                                        value={selectedEngineer}
                                        onChange={(e) => setSelectedEngineer(e.target.value)}
                                        className="p-2 border rounded"
                                    >
                                        <option value="">Select Engineer</option>
                                        {engineers.map((engineer) => (
                                            <option key={engineer.id} value={engineer.id}>
                                                {engineer.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="New Engineer Name"
                                        value={newEngineer}
                                        onChange={(e) => setNewEngineer(e.target.value)}
                                        className="p-2 border rounded"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddEngineer}
                                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add Engineer"}
                                </button>

                                <h2 className="text-lg font-bold mt-4">Add New Service Engineer</h2>

                                <div className="mt-2 space-y-2">
                                    {serviceEngineers.map((engineer) => (
                                        <div key={engineer.id} className="flex items-center justify-between p-2 border rounded">
                                            <span>{engineer.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteServiceEngineer(engineer.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <select
                                    name="selectedServiceEngineer"
                                    value={selectedServiceEngineer}
                                    onChange={(e) => setSelectedServiceEngineer(e.target.value)}
                                    className="p-2 border rounded"
                                >
                                    <option value="">Select Service Engineer</option>
                                    {serviceEngineers.map((engineer) => (
                                        <option key={engineer.id} value={engineer.id}>
                                            {engineer.name}
                                        </option>
                                    ))}
                                </select>

                                    <input
                                        type="text"
                                        placeholder="New Service Engineer Name"
                                        value={newServiceEngineer}
                                        onChange={(e) => setNewServiceEngineer(e.target.value)}
                                        className="p-2 border rounded"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddServiceEngineer}
                                    className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add Service Engineer"}
                                </button>

                            </form>
                        </CardContent>
                        <CardFooter></CardFooter>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}