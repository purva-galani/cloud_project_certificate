'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ModeToggle } from "@/components/ModeToggle"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, SearchIcon, Edit2Icon, DeleteIcon } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Selection, SortDescriptor, Pagination, Tooltip } from "@heroui/react"
import axios from "axios";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

interface ContactPerson {
    firstName: string;
    middleName: string;
    lastName: string;
    contactNo: string;
    email: string;
    designation: string;
    _id: string;
    key?: string;
    createdAt?: string;
    updatedAt?: string;
}

const columns = [
    { name: "First Name", uid: "firstName", sortable: true, width: "120px" },
    { name: "Middle Name", uid: "middleName", sortable: true, width: "120px" },
    { name: "Last Name", uid: "lastName", sortable: true, width: "120px" },
    { name: "Contact Number", uid: "contactNo", sortable: true, width: "120px" },
    { name: "Email Address", uid: "email", sortable: true, width: "120px" },
    { name: "Designation", uid: "designation", sortable: true, width: "120px" },
];

const INITIAL_VISIBLE_COLUMNS = ["firstName", "middleName", "lastName", "contactNo", "email", "designation"];

export default function AdminContactTable() {
    const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
    const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "createdAt",
        direction: "descending" as const, // Explicitly type as "descending"
    });

    const [page, setPage] = React.useState(1);
    const router = useRouter();
    const [filterValue, setFilterValue] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<ContactPerson | null>(null);
    const hasSearchFilter = Boolean(filterValue);

    const fetchContactPersons = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/v1/contactperson/getContactPersons`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            let contactPersonsData = response.data.data || [];

            // Sort by createdAt descending (newest first)
            contactPersonsData.sort((a: ContactPerson, b: ContactPerson) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });

            setContactPersons(contactPersonsData);
            setError(null);
        } catch (error) {
            console.error("Error fetching contact persons:", error);
            setError("Failed to fetch contact persons. Please try again.");
            setContactPersons([]);
        }
    };

    useEffect(() => {
        fetchContactPersons();
    }, []);

    const handleSelectionChange = (keys: Selection) => {
        setSelectedKeys(keys);
    };
    
    const handleSortChange = (descriptor: SortDescriptor) => {
        setSortDescriptor(descriptor);
    };
    const handleDeleteClick = (contactPerson: ContactPerson) => {
        setContactToDelete(contactPerson);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!contactToDelete) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/v1/contactperson/deleteContactPerson/${contactToDelete._id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setIsDeleteModalOpen(false);
            setContactToDelete(null);
            await fetchContactPersons();
            toast.success("Contact person deleted successfully");
        } catch (error) {
            console.error("Error deleting contact person:", error);
            toast.error("Failed to delete contact person");
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setContactToDelete(null);
    };

    const ConfirmationDialog = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                <div className="bg-black p-6 rounded shadow-md max-w-sm w-full">
                    <h3 className="text-lg font-semibold text-white">Are you sure you want to delete this contact?</h3>
                    <div className="mt-4 flex justify-end gap-4">
                        <Button onClick={onClose} variant="outline" className="text-white border-white">Cancel</Button>
                        <Button onClick={onConfirm} className="bg-red-500 text-white">Delete</Button>
                    </div>
                </div>
            </div>


        );
    };

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;
        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredContacts = [...contactPersons];

        if (hasSearchFilter) {
            filteredContacts = filteredContacts.filter((contact) =>
                contact.firstName.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.middleName.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.lastName.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.email.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.contactNo.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.designation.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredContacts;
    }, [contactPersons, hasSearchFilter, filterValue]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof ContactPerson] || "";
            const second = b[sortDescriptor.column as keyof ContactPerson] || "";

            // Case-insensitive string comparison
            const cmp = String(first).localeCompare(String(second), undefined, { sensitivity: 'base' });

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        setPage(1);
    }, []);

    const topContent = React.useMemo(() => {
        return (
            <div className="flex justify-between gap-3 items-end">
                <Input
                    isClearable
                    className="w-full max-w-[300px]"
                    placeholder="Search"
                    startContent={<SearchIcon className="h-4 w-5 text-muted-foreground" />}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    onClear={() => setFilterValue("")}
                />
                <label className="flex items-center text-default-400 text-small">
                    Rows per page:
                    <select
                        className="bg-transparent dark:bg-gray-800 outline-none text-default-400 text-small"
                        onChange={onRowsPerPageChange}
                        defaultValue="5"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                    </select>
                </label>
            </div>
        );
    }, [filterValue, onRowsPerPageChange, contactPersons.length]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="text-default-400 text-small">
                    Total {contactPersons.length} contact
                </span>
                <Pagination
                    isCompact
                    showShadow
                    color="success"
                    page={page}
                    total={pages}
                    onChange={setPage}
                    classNames={{
                        cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
                        item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
                    }}
                />
                <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        className="bg-[hsl(339.92deg_91.04%_52.35%)]"
                        variant="default"
                        size="sm"
                        disabled={page === 1}
                        onClick={onPreviousPage}
                    >
                        Previous
                    </Button>
                    <Button
                        className="bg-[hsl(339.92deg_91.04%_52.35%)]"
                        variant="default"
                        size="sm"
                        disabled={page === pages}
                        onClick={onNextPage}
                    >
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [page, pages, onPreviousPage, onNextPage]);

    const renderCell = React.useCallback((contact: ContactPerson, columnKey: string): React.ReactNode => {
        const cellValue = contact[columnKey as keyof ContactPerson];

        switch (columnKey) {
            case "actions":
            case "createdAt":
                return new Date(cellValue as string).toLocaleDateString();
            default:
                return cellValue;
        }
    }, []);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <ModeToggle />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbLink href="/user/dashboard">
                                    Dashboard
                                </BreadcrumbLink>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/user/contactform">
                                        Create Contact
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
                    <Card className="max-w-7xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center">Contact Record</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table
                                isHeaderSticky
                                aria-label="Contacts table with custom cells, pagination, and sorting"
                                bottomContent={bottomContent}
                                bottomContentPlacement="outside"
                                classNames={{
                                    wrapper: "max-h-[382px] overflow-y-auto",
                                }}
                                selectedKeys={selectedKeys}
                                sortDescriptor={sortDescriptor}
                                topContent={topContent}
                                topContentPlacement="outside"
                                onSelectionChange={setSelectedKeys}
                                onSortChange={setSortDescriptor}
                            >
                                <TableHeader>
                                    {columns.map((column) => (
                                        <TableColumn
                                            key={column.uid}
                                            onClick={() => {
                                                setSortDescriptor(prev => ({
                                                    column: column.uid,
                                                    direction: prev.column === column.uid && prev.direction === "ascending"
                                                        ? "descending"
                                                        : "ascending"
                                                }));
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                {column.name}
                                                {sortDescriptor.column === column.uid && (
                                                    <span className="ml-1">
                                                        {sortDescriptor.direction === "ascending" ? "↑" : "↓"}
                                                    </span>
                                                )}
                                            </div>
                                        </TableColumn>
                                    ))}
                                </TableHeader>
                                <TableBody emptyContent={"Create contact and add data"}>
                                    {sortedItems.map((contact) => (
                                        <TableRow key={contact._id}>
                                            {headerColumns.map((column) => (
                                                <TableCell key={column.uid}>
                                                    {renderCell(contact, column.uid)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>

            <ConfirmationDialog
                isOpen={isDeleteModalOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </SidebarProvider>
    );
}