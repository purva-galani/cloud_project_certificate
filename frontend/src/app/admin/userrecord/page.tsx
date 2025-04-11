'use client';
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";
import { Loader2, SearchIcon, Edit2Icon, DeleteIcon, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { ModeToggle } from "@/components/ModeToggle";
import { Pagination, Tooltip } from "@heroui/react";
import { AdminSidebar } from "@/components/admin-sidebar";

interface User {
  _id: string;
  name: string;
  email: string;
  contact: number;
}

const columns = [
  { name: "NAME", uid: "name", sortable: true, width: "120px" },
  { name: "EMAIL", uid: "email", sortable: true, width: "120px" },
  { name: "CONTACT", uid: "contact", sortable: true, width: "120px" },

  { name: "ACTIONS", uid: "actions", sortable: false, width: "100px" },
];

const INITIAL_VISIBLE_COLUMNS = ["name", "email", "contact", "actions"];

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [visibleColumns] = useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [page, setPage] = useState(1);
  const router = useRouter();

  const [sortDescriptor, setSortDescriptor] = useState({
    column: "name",
    direction: "ascending" as "ascending" | "descending",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/users/getusers");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/users/deleteuser/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setUsers(prev => prev.filter(user => user._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const headerColumns = React.useMemo(() => {
    return columns.filter(column => visibleColumns.has(column.uid));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filtered = [...users];

    if (filterValue) {
      const searchLower = filterValue.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [users, filterValue]);

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof User] || "";
      const second = b[sortDescriptor.column as keyof User] || "";

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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[80%]"
            placeholder="Search by name..."
            startContent={<SearchIcon className="h-4 w-10 text-muted-foreground" />}
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            onClear={() => setFilterValue("")}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {users.length} users</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent dark:bg-gray-800 outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
              defaultValue="15"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, onRowsPerPageChange, users.length]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400"></span>
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

  const renderCell = useCallback((user: User, columnKey: string) => {
    if (columnKey === "actions") {
      return (
        <div className="relative flex items-center gap-2">


          <Tooltip>
            <span
              className="text-lg text-danger cursor-pointer active:opacity-50"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(user._id);
              }}
            >
              <DeleteIcon className="h-6 w-6" />
            </span>
          </Tooltip>
        </div>
      );
    }
    return user[columnKey as keyof User];
  }, [router]);

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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/userform">
                    <BreadcrumbPage>Create User</BreadcrumbPage>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">User Record</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15 max-h-screen-xl max-w-screen-xl">
                <Table
                  isHeaderSticky
                  aria-label="Users table with custom cells, pagination and sorting"
                  bottomContent={bottomContent}
                  bottomContentPlacement="outside"
                  classNames={{
                    wrapper: "max-h-[382px] overflow-y-auto",
                  }}
                  sortDescriptor={sortDescriptor}
                  topContent={topContent}
                  topContentPlacement="outside"
                  onSortChange={(descriptor) => {
                    setSortDescriptor({
                      column: descriptor.column as string,
                      direction: descriptor.direction as "ascending" | "descending",
                    });
                  }}
                >
                  <TableHeader columns={headerColumns}>
                    {(column) => (
                      <TableColumn
                        key={column.uid}
                        align={column.uid === "actions" ? "center" : "start"}
                        allowsSorting={column.sortable}
                      >
                        {column.name}
                      </TableColumn>
                    )}
                  </TableHeader>
                  <TableBody emptyContent={"No users found"} items={paginatedItems}>
                    {(item) => (
                      <TableRow key={item._id}>
                        {(columnKey) => <TableCell style={{ fontSize: "12px", padding: "8px" }}>{renderCell(item, columnKey as string)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
