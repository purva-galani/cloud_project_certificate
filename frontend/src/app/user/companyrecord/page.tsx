'use client';
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";
import { Loader2, SearchIcon, Edit2Icon, DeleteIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { ModeToggle } from "@/components/ModeToggle";
import { Pagination, Tooltip } from "@heroui/react";
import { compareAsc } from "date-fns";
import { AppSidebar } from "@/components/app-sidebar";

interface CompanyDetails {
    _id: string;
    companyName: string;
    address: string;
    gstNumber: string;
    industries: string;
    website: string;
    industriesType: string;
    flag: string;
}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const columns = [
    { name: "Company Name", uid: "companyName", sortable: true, width: "120px" },
    { name: "Company Address", uid: "address", sortable: true, width: "120px" },
    { name: "Industries", uid: "industries", sortable: true, width: "120px" },
    { name: "Industries Type", uid: "industriesType", sortable: true, width: "120px" },
    { name: "GST Number", uid: "gstNumber", sortable: true, width: "120px" },
    { name: "Website", uid: "website", sortable: true, width: "120px" },
    { name: "Flag", uid: "flag", sortable: true, width: "120px" },
];

const INITIAL_VISIBLE_COLUMNS = ["companyName", "address", "gstNumber", "industries", "website", "industriesType", "flag"];

export default function CompanyDetailsTable() {
    const [companies, setCompanies] = useState<CompanyDetails[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [page, setPage] = useState(1);
    const [filterValue, setFilterValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [contactToDelete, setContactToDelete] = useState<CompanyDetails | null>(null); // To handle contact deletion
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // To toggle delete modal

    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
      }>({
        column: "",
        direction: "ascending",
      });
      

    const router = useRouter();
    const hasSearchFilter = Boolean(filterValue);

    const fetchCompanies = async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/v1/company/getAllcompanies`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const companiesData = Array.isArray(response.data)
                ? response.data
                : response.data?.data
                    ? response.data.data
                    : [];

            const companiesWithKeys = companiesData
                .reverse() // 👈 Latest added data comes first
                .map((company: CompanyDetails) => ({
                    ...company,
                    key: company._id || generateUniqueId(),
                }));

            setCompanies(companiesWithKeys);
            setError(null);
        } catch (error) {
            console.error("Error fetching companies:", error);
            setError("Failed to fetch companies. Please try again.");
            setCompanies([]);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleDeleteClick = (company: CompanyDetails) => {
        setContactToDelete(company); // Set the company to delete
        setIsDeleteModalOpen(true); // Open the modal
    };

    const handleConfirmDelete = async () => {
        if (!contactToDelete) return;

        try {
            await axios.delete(
                `http://localhost:5000/api/v1/company/deleteCompany/${contactToDelete._id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setIsDeleteModalOpen(false);
            setContactToDelete(null);
            await fetchCompanies();
            toast.success("Company deleted successfully");
        } catch (error) {
            console.error("Error deleting company:", error);
            toast.error("Failed to delete company");
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
                    <h3 className="text-lg font-semibold text-white">Are you sure you want to delete this company?</h3>
                    <div className="mt-4 flex justify-end gap-4">
                        <Button onClick={onClose} variant="outline" className="text-white border-white">Cancel</Button>
                        <Button onClick={onConfirm} className="bg-red-500 text-white">Delete</Button>
                    </div>
                </div>
            </div>
        );
    };

    const headerColumns = React.useMemo(() => {
        return columns.filter(column => visibleColumns.has(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filtered = [...companies];

        if (hasSearchFilter) {
            const searchLower = filterValue.toLowerCase();
            filtered = filtered.filter(company =>
                company.companyName.toLowerCase().includes(searchLower) ||
                company.gstNumber.toLowerCase().includes(searchLower) ||
                company.address.toLowerCase().includes(searchLower) ||
                company.industries.toLowerCase().includes(searchLower) ||
                company.industriesType.toLowerCase().includes(searchLower) ||
                company.website.toLowerCase().includes(searchLower) ||
                company.flag.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [companies, filterValue, hasSearchFilter]);

    const sortedItems = React.useMemo(() => {
        if (!sortDescriptor.column) {
            // No sorting = just show as-is (which is reversed from fetch)
            return filteredItems;
        }

        return [...filteredItems].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof CompanyDetails] || "";
            const second = b[sortDescriptor.column as keyof CompanyDetails] || "";

            let cmp = 0;
            if (first < second) cmp = -1;
            if (first > second) cmp = 1;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [filteredItems, sortDescriptor]);

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
    }, [filterValue, onRowsPerPageChange, companies.length]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="text-default-400 text-small">
                    Total {companies.length} company
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
    }, [page, pages, onPreviousPage, onNextPage]);

    const renderCell = useCallback((company: CompanyDetails, columnKey: string) => {
        if (columnKey === "actions") {
        }
        return company[columnKey as keyof CompanyDetails];
    }, [isDownloading, router]);

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
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/user/dashboard">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/user/companyform">
                                        Create Company
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
                    <Card className="max-w-6xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center">Company Record</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table
                                isHeaderSticky
                                aria-label="Companies table with custom cells, pagination and sorting"
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
                                                if (!column.sortable) return;
                                                setSortDescriptor(prev => ({
                                                    column: column.uid,
                                                    direction:
                                                        prev.column === column.uid && prev.direction === "ascending"
                                                            ? "descending"
                                                            : "ascending",
                                                }));
                                            }}
                                            style={{ cursor: column.sortable ? "pointer" : "default" }}
                                        >
                                            {column.name}
                                            {sortDescriptor.column === column.uid && (
                                                <span className="ml-1">
                                                    {sortDescriptor.direction === "ascending" ? "▲" : "▼"}
                                                </span>
                                            )}
                                        </TableColumn>
                                    ))}
                                </TableHeader>
                                <TableBody emptyContent={"Create company and add data"} items={paginatedItems}>
                                    {(item) => (
                                        <TableRow key={item._id}>
                                            {(columnKey) => <TableCell style={{ fontSize: "12px", padding: "8px" }}>{renderCell(item, columnKey as string)}</TableCell>}
                                        </TableRow>
                                    )}
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