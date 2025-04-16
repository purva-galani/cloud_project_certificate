'use client';
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { SearchIcon, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {SortDescriptor, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { ModeToggle } from "@/components/ModeToggle";
import { Pagination, Tooltip } from "@heroui/react";
import { AdminSidebar } from "@/components/admin-sidebar";

// Define the ContactPerson type
interface ContactPerson {
    firstName: string;
    middleName: string;
    lastName: string;
    contactNo: string;
    email: string;
    designation: string;
    _id: string;
    key?: string;
    createdAt: string; // Add createdAt field if available from API
}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Define columns for the table
const columns = [
    { name: "First Name", uid: "firstName", sortable: true, width: "120px" },
    { name: "Middle Name", uid: "middleName", sortable: true, width: "120px" },
    { name: "Last Name", uid: "lastName", sortable: true, width: "120px" },
    { name: "Contact Number", uid: "contactNo", sortable: true, width: "120px" },
    { name: "Email Address", uid: "email", sortable: true, width: "120px" },
    { name: "Designation", uid: "designation", sortable: true, width: "120px" },
    { name: "Action", uid: "actions", sortable: false, width: "120px" },
];

// Define initial visible columns
const INITIAL_VISIBLE_COLUMNS = ["firstName", "middleName", "lastName", "contactNo", "email", "designation", "actions"];

export default function ContactPersonDetailsTable() {
    const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set([]));
    const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = React.useState<string>("all");
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "createdAt",
        direction: "descending",
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
            contactPersonsData.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Replace the entire array with the new sorted data
            setContactPersons(contactPersonsData);

            setError(null);
        } catch (error) {
            console.error("Error fetching contact persons:", error);
            setError("Failed to fetch contact persons. Please try again.");
            setContactPersons([]);
        }
    };


    // Delete contact person by ID
    const handleDelete = async (contactPersonId: string) => {
        if (!window.confirm("Are you sure you want to delete this contact?")) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:5000/api/v1/contactperson/deleteContactPerson/${contactPersonId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setContactPersons(prev => prev.filter(contact => contact._id !== contactPersonId));
            toast({
                title: "Contact Deleted",
                description: "The contact has been successfully deleted",
            });
        } catch (error) {
            console.error("Error deleting contact person:", error);
            toast({
                title: "Error",
                description: "Could not delete contact person. Please try again.",
                variant: "destructive",
            });
        }
    };


    const headerColumns = React.useMemo(() => {
        return columns.filter((column) => visibleColumns.has(column.uid));
    }, [visibleColumns]);
    const filteredItems = React.useMemo(() => {
        let filteredContacts = [...contactPersons];

        if (hasSearchFilter) {
            filteredContacts = filteredContacts.filter((contact) =>
                contact.firstName.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.middleName.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.lastName.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.contactNo.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.email.toLowerCase().includes(filterValue.toLowerCase()) ||
                contact.designation.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        return filteredContacts;
    }, [contactPersons, hasSearchFilter, filterValue]);

    const sortedItems = React.useMemo(() => {
        if (!sortDescriptor.column) return filteredItems;

        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof ContactPerson] || "";
            const second = b[sortDescriptor.column as keyof ContactPerson] || "";

            let cmp = 0;
            if (first < second) cmp = -1;
            if (first > second) cmp = 1;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);


    // Pagination logic
    const paginatedItems = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return sortedItems.slice(start, start + rowsPerPage);
    }, [sortedItems, page, rowsPerPage]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

    const onNextPage = useCallback(() => {
        if (page < pages) setPage(page + 1);
    }, [page, pages]);

    const onPreviousPage = useCallback(() => {
        if (page > 1) setPage(page - 1);
    }, [page]);

    const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const topContent = React.useMemo(() => {
        return (
            <div className="flex justify-between items-center gap-4">
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
                        className="bg-transparent dark:bg-gray-800 outline-none text-default-400 text-small ml-2"
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
    }, [filterValue, onRowsPerPageChange]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 relative flex justify-between items-center">
                <span className="text-default-400 text-small">
                Total {filteredItems.length} contact{filteredItems.length !== 1 ? 's' : ''}
                </span>
                <div className="absolute left-1/2 transform -translate-x-1/2">
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
                </div>
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
    }, [page, pages, onPreviousPage, onNextPage, contactPersons.length]);

    const renderCell = useCallback((contact: ContactPerson, columnKey: string) => {
        if (columnKey === "actions") {
            return (
                <div className="relative flex items-center gap-2">
                    <Tooltip>
                        <span
                            className="text-lg text-info cursor-pointer active:opacity-50"
                            onClick={(e) => {
                                e.preventDefault();
                                router.push(`contactform?id=${contact._id}`);
                            }}
                        >
                            <Edit className="h-6 w-6" />
                        </span>
                    </Tooltip>
                    <Tooltip>
                        <span
                            className="text-lg text-danger cursor-pointer"
                            onClick={() => handleDelete(contact._id)}
                        >
                            <Trash2 />
                        </span>
                    </Tooltip>

                </div>
            );
        }
        return contact[columnKey as keyof ContactPerson];
    }, []);

    useEffect(() => {
        fetchContactPersons();
    }, []);

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
                                <BreadcrumbLink href="/admin/dashboard">
                                    Dashboard
                                </BreadcrumbLink>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/contactform">
                                        Create Contact
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
                    <Card className="max-w-6xl mx-auto">
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
                                onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
                                onSortChange={(descriptor) => {
                                    setSortDescriptor({
                                        column: descriptor.column as string,
                                        direction: descriptor.direction as "ascending" | "descending",
                                    });
                                }}
                            >
                                <TableHeader>
                                    {columns.map((column) => (
                                        <TableColumn
                                            key={column.uid}
                                            allowsSorting={column.sortable}
                                            onClick={() => {
                                                setSortDescriptor((prev) => {
                                                    if (prev.column === column.uid) {
                                                        return {
                                                            column: column.uid,
                                                            direction: prev.direction === "ascending" ? "descending" : "ascending",
                                                        };
                                                    } else {
                                                        return {
                                                            column: column.uid,
                                                            direction: "ascending",
                                                        };
                                                    }
                                                });
                                            }}
                                        >
                                            {column.name}
                                            {sortDescriptor.column === column.uid && (
                                                <span className="ml-1 text-xs">
                                                    {sortDescriptor.direction === "ascending" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </TableColumn>
                                    ))}
                                </TableHeader>
                                <TableBody emptyContent={"Create contact and add data"}>
                                    {paginatedItems.map((contact) => (
                                        <TableRow key={contact._id}>
                                            {headerColumns.map((column) => (
                                                <TableCell key={column.uid}  style={{ fontSize: "12px", padding: "8px" }}>
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
        </SidebarProvider>
    );
}