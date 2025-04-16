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
    _id?: string; 
    model_name: string;
    range: string;
}

interface Engineer {
    id: string;
    _id?: string;
    name: string;
}

interface ServiceEngineer {
    id: string;
    _id?: string;
    name: string;
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
    const [deleteLoading, setDeleteLoading] = useState<{
        model?: string | null;
        engineer?: string | null;
        serviceEngineer?: string | null;
    }>({
        model: null,
        engineer: null,
        serviceEngineer: null
    });
    const [engineers, setEngineers] = useState<Engineer[]>([]);
    const [newEngineer, setNewEngineer] = useState<string>("");
    const [selectedEngineer, setSelectedEngineer] = useState<string>("");
    const [serviceEngineers, setServiceEngineers] = useState<ServiceEngineer[]>([]);
    const [newServiceEngineer, setNewServiceEngineer] = useState<string>("");
    const [selectedServiceEngineer, setSelectedServiceEngineer] = useState<string>("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/v1/addcategory/getCategories');
                const data = await response.json();
                const normalizedModels = data.map((item: any) => ({
                    id: item._id || item.id,
                    model_name: item.model_name,
                    range: item.range
                }));
                setModels(normalizedModels);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        const fetchServiceEngineers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/v1/ServiceEngineer/getServiceEngineers");
                const data = await response.json();
                const normalizedServiceEngineers = data.map((item: any) => ({
                    id: item._id || item.id,
                    name: item.name
                }));
                setServiceEngineers(normalizedServiceEngineers);
            } catch (error) {
                console.error("Error fetching service engineers:", error);
            }
        };

        const fetchEngineers = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/v1/engineers/getEngineers");
                const data = await response.json();
                const normalizedEngineers = data.map((item: any) => ({
                    id: item._id || item.id,
                    name: item.name
                }));
                setEngineers(normalizedEngineers);
            } catch (error) {
                console.error("Error fetching engineers:", error);
            }
        };

        fetchCategories();
        fetchServiceEngineers();
        fetchEngineers();
    }, []);

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
                    const newId = result._id || result.id;
                    if (!newId) {
                        throw new Error("No ID returned from server");
                    }
                    
                    setModels(prevModels => [...prevModels, { 
                        id: newId, 
                        model_name: newModel, 
                        range: newRange 
                    }]);
                    
                    setNewModel("");
                    setNewRange("");
                    toast({
                        title: "Add Successful!",
                        description: "Model and range added successfully!",
                    });
                } else {
                    throw new Error(result.error || "Failed to add model");
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
                    const newId = result._id || result.id;
                    setEngineers(prev => [...prev, { id: newId, name: newEngineer }]);
                    setNewEngineer("");
                    toast({
                        title: "Add Successful!",
                        description: "Engineer added successfully!",
                    });
                } else {
                    throw new Error(result.error || "Failed to add engineer");
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

                const result = await response.json();
                if (response.ok) {
                    const newId = result._id || result.id;
                    setServiceEngineers(prev => [...prev, { id: newId, name: newServiceEngineer }]);
                    setNewServiceEngineer("");
                    toast({
                        title: "Add Successful!",
                        description: "Service engineer added successfully!",
                    });
                } else {
                    throw new Error(result.error || "Failed to add service engineer");
                }
            } catch (error) {
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
        if (!id || typeof id !== 'string') {
            toast({
                title: "Error",
                description: "Invalid model ID",
                variant: "destructive",
            });
            return;
        }
    
        if (!window.confirm("Are you sure you want to delete this model?")) {
            return;
        }
    
        setDeleteLoading({ model: id });
            try {
            const response = await fetch(`http://localhost:5000/api/v1/addcategory/deleteCategory/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete category");
            }
    
            setModels(prevModels => prevModels.filter(model => model.id !== id));
    
            setFormData(prev => {
                const deletedModel = models.find(m => m.id === id);
                return deletedModel && prev.makeModel === deletedModel.model_name
                    ? { ...prev, makeModel: "", range: "" }
                    : prev;
            });
    
            toast({
                title: "Delete Successful!",
                description: "Model and range deleted successfully!",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error deleting model",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading({ model: null, engineer: null, serviceEngineer: null });
        }
    };

    const handleDeleteEngineer = async (id: string) => {
        if (!id || typeof id !== 'string') {
            toast({
                title: "Error",
                description: "Invalid engineer ID",
                variant: "destructive",
            });
            return;
        }

        if (!window.confirm("Are you sure you want to delete this engineer?")) {
            return;
        }

        setDeleteLoading(prev => ({ ...prev, engineer: id }));
        try {
            const response = await fetch(`http://localhost:5000/api/v1/engineers/deleteEngineer/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete engineer");
            }

            setEngineers(prev => prev.filter(engineer => engineer.id !== id));
            
            if (selectedEngineer === id) {
                setSelectedEngineer("");
            }

            toast({
                title: "Delete Successful!",
                description: "Engineer deleted successfully!",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error deleting engineer",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading(prev => ({ ...prev, engineer: null }));
        }
    };

    const handleDeleteServiceEngineer = async (id: string) => {
        if (!id || typeof id !== 'string') {
            toast({
                title: "Error",
                description: "Invalid service engineer ID",
                variant: "destructive",
            });
            return;
        }

        if (!window.confirm("Are you sure you want to delete this service engineer?")) {
            return;
        }

        setDeleteLoading(prev => ({ ...prev, serviceEngineer: id }));
        try {
            const response = await fetch(`http://localhost:5000/api/v1/ServiceEngineer/deleteServiceEngineer/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete service engineer");
            }

            setServiceEngineers(prev => prev.filter(engineer => engineer.id !== id));
            
            if (selectedServiceEngineer === id) {
                setSelectedServiceEngineer("");
            }

            toast({
                title: "Delete Successful!",
                description: "Service engineer deleted successfully!",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error deleting service engineer",
                variant: "destructive",
            });
        } finally {
            setDeleteLoading(prev => ({ ...prev, serviceEngineer: null }));
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
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            <>
                                <h2 className="text-lg font-bold mt-4">Add New Model and Range</h2>
                                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                        {models.length > 0 ? (
                                            models.map((model) => (
                                                <div key={`model-${model.id}`} className="flex items-center justify-between p-2 border rounded">
                                                    <span>{model.model_name} - {model.range}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteModel(model.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                        disabled={deleteLoading.model === model.id}
                                                    >
                                                        {deleteLoading.model === model.id ? "Deleting..." : <Trash2 size={18} />}
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-gray-500">
                                            No models available
                                            </div>
                                        )}
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
                                                <option key={`option-${model.id}`} value={model.model_name}>
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
                                </>

                                <>
                                    <h2 className="text-lg font-bold mt-4">Engineers</h2>
                                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                        {engineers.length > 0 ? (
                                            engineers.map((engineer) => (
                                                <div key={`engineer-${engineer.id}`} className="flex items-center justify-between p-2 border rounded">
                                                    <span>{engineer.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteEngineer(engineer.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                        disabled={deleteLoading.engineer === engineer.id}
                                                    >
                                                        {deleteLoading.engineer === engineer.id ? "Deleting..." : <Trash2 size={18} />}
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-gray-500">
                                                No engineers available
                                            </div>
                                        )}
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
                                                <option key={`engineer-opt-${engineer.id}`} value={engineer.id}>
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
                                </>

                                {/* Service Engineer Section */}
                                <>
                                    <h2 className="text-lg font-bold mt-4">Service Engineers</h2>
                                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                                        {serviceEngineers.length > 0 ? (
                                            serviceEngineers.map((engineer) => (
                                                <div key={`service-engineer-${engineer.id}`} className="flex items-center justify-between p-2 border rounded">
                                                    <span>{engineer.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteServiceEngineer(engineer.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                        disabled={deleteLoading.serviceEngineer === engineer.id}
                                                    >
                                                        {deleteLoading.serviceEngineer === engineer.id ? "Deleting..." : <Trash2 size={18} />}
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-center text-gray-500">
                                                No service engineers available
                                            </div>
                                        )}
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
                                                <option key={`service-engineer-opt-${engineer.id}`} value={engineer.id}>
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
                                </>
                            </form>
                        </CardContent>
                        <CardFooter></CardFooter>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}