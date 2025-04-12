'use client';

import { AppSidebar } from "@/components/admin-sidebar"
import { ModeToggle } from "@/components/ModeToggle"
import { Breadcrumb, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbList, BreadcrumbLink, BreadcrumbItem } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import u from "../admin/u/page"

import React, { useEffect, useState } from "react"
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button"
import { CalendarIcon, Edit, Trash2, Loader2, SearchIcon, Edit2Icon, FileDown, DeleteIcon } from "lucide-react"
import { Metadata } from "next"
import { Input } from "@/components/ui/input"
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Selection, ChipProps, Select } from "@heroui/react"
import { Pagination, Tooltip } from "@heroui/react"

interface Certificate {
  _id: string;
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
  engineerName: string;
  [key: string]: string;
}

interface Service {
  _id: string;
  nameAndLocation: string;
  contactPerson: string;
  contactNumber: string;
  serviceEngineer: string;
  date: string;
  place: string;
  placeOptions: string;
  natureOfJob: string;
  reportNo: string;
  makeModelNumberoftheInstrumentQuantity: string;
  serialNumberoftheInstrumentCalibratedOK: string;
  serialNumberoftheFaultyNonWorkingInstruments: string;
  engineerName: string;
}

type SortDescriptor = {
  column: string;
  direction: 'ascending' | 'descending';
}

type SortDescriptorservice = {
  column: string;
  direction: 'ascending' | 'descending';
}

interface CertificateResponse {
  certificateId: string;
  message: string;
  downloadUrl: string;
}

interface ServiceResponse {
  serviceId: string;
  message: string;
  downloadUrl: string;
}

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const generateUniqueIdservice = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

const columns = [
  { name: "CERTIFICATE NO", uid: "certificateNo", sortable: true, width: "120px" },
  { name: "CUSTOMER", uid: "customerName", sortable: true, width: "120px" },
  { name: "SITE LOCATION", uid: "siteLocation", sortable: true, width: "120px" },
  { name: "MAKE MODEL", uid: "makeModel", sortable: true, width: "120px" },
  { name: "SERIAL NO", uid: "serialNo", sortable: true, width: "120px" },
  { name: "ENGINEER NAME", uid: "engineerName", sortable: true, width: "120px" },
];

const columnsservice = [
  { name: "CONTACT PERSON", uid: "contactPerson", sortable: true, width: "120px" },
  { name: "CONTACT NUMBER", uid: "contactNumber", sortable: true, width: "120px" },
  { name: "SERVICE ENGINEER", uid: "serviceEngineer", sortable: true, width: "120px" },
  { name: "REPORT NO", uid: "reportNo", sortable: true, width: "120px" },
  { name: "ACTION", uid: "actions", sortable: true, width: "100px" },
];

export const statusOptions = [
  { name: "Paused", uid: "paused" },
  { name: "Vacation", uid: "vacation" },
];

const statusColorMap: Record<string, ChipProps["color"]> = {
  active: "success",
  paused: "danger",
  vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["certificateNo", "customerName", "siteLocation", "makeModel", "range", "serialNo", "calibrationGas", "gasCanisterDetails", "dateOfCalibration", "calibrationDueDate", "engineerName", "actions"];
const INITIAL_VISIBLE_COLUMNS_SERVICE = ["nameAndLocation", "contactPerson", "contactNumber", "serviceEngineer", "reportNo", "actions"];

export default function Page() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(new Set(columns.map(column => column.uid)));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
      column: "certificateNo",
      direction: "ascending",
  });
  const [page, setPage] = React.useState(1);
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState<ServiceResponse | null>(null);
  const [errorService, setErrorService] = useState<string | null>(null);
  const [selectedKeysService, setSelectedKeysService] = React.useState<Set<string>>(new Set([]));
  const [visibleColumnsService, setVisibleColumnsService] = React.useState<Selection>(new Set(columnsservice.map(column => column.uid)));
  const [statusFilterService, setStatusFilterService] = React.useState<Selection>("all");
  const [rowsPerPageService, setRowsPerPageService] = useState(15);
  const [sortDescriptorService, setSortDescriptorService] = React.useState<SortDescriptorservice>({
      column: "nameAndLocation",
      direction: "ascending",
  });
  const [pageService, setPageService] = React.useState(1);
  const routerService = useRouter();
  const [isDownloadingService, setIsDownloadingService] = useState<string | null>(null);

  const fetchCertificates = async () => {
      try {
          const response = await axios.get(
              "http://localhost:5000/api/v1/certificates/getCertificate",
              {
                  headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${localStorage.getItem("token")}`
                  }
              }
          );

          // Log the response structure
          console.log('Full API Response:', {
              status: response.status,
              data: response.data,
              type: typeof response.data,
              hasData: 'data' in response.data
          });

          // Handle the response based on its structure
          let certificatesData;
          if (typeof response.data === 'object' && 'data' in response.data) {
              // Response format: { data: [...certificates] }
              certificatesData = response.data.data;
          } else if (Array.isArray(response.data)) {
              // Response format: [...certificates]
              certificatesData = response.data;
          } else {
              console.error('Unexpected response format:', response.data);
              throw new Error('Invalid response format');
          }

          if (!Array.isArray(certificatesData)) {
              certificatesData = [];
          }

          const certificatesWithKeys = certificatesData.map((certificate: Certificate) => ({
              ...certificate,
              key: certificate._id || generateUniqueId()
          }));

          setCertificates(certificatesWithKeys);
          setError(null); // Clear any previous errors
      } catch (error) {
          console.error("Error fetching leads:", error);
          if (axios.isAxiosError(error)) {
              setError(`Failed to fetch leads: ${error.response?.data?.message || error.message}`);
          } else {
              setError("Failed to fetch leads.");
          }
          setCertificates([]); // Set empty array on error
      }
  };
  useEffect(() => {
      fetchCertificates();
  }, []);

  const fetchServices = async () => {
    try {
        const response = await axios.get(
            "http://localhost:5000/api/v1/services/getServices",
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        // Log the response structure
        console.log('Full API Response:', {
            status: response.status,
            data: response.data,
            type: typeof response.data,
            hasData: 'data' in response.data
        });

        // Handle the response based on its structure
        let servicesData;
        if (typeof response.data === 'object' && 'data' in response.data) {
            // Response format: { data: [...services] }
            servicesData = response.data.data;
        } else if (Array.isArray(response.data)) {
            // Response format: [...services]
            servicesData = response.data;
        } else {
            console.error('Unexpected response format:', response.data);
            throw new Error('Invalid response format');
        }

        // Ensure servicesData is an array
        if (!Array.isArray(servicesData)) {
            servicesData = [];
        }

        // Map the data with safe key generation
        const servicesWithKeys = servicesData.map((service: Service) => ({
            ...service,
            key: service._id || generateUniqueId()
        }));

        setServices(servicesWithKeys);
        setError(null); // Clear any previous errors
    } catch (error) {
        console.error("Error fetching services:", error);
        if (axios.isAxiosError(error)) {
            setError(`Failed to fetch services: ${error.response?.data?.message || error.message}`);
        } else {
            setError("Failed to fetch services.");
        }
        setServices([]); // Set empty array on error
    }
};
  useEffect(() => {
      fetchServices();
  }, []);

  const [filterValue, setFilterValue] = useState("");
  const [filterValueservice, setFilterValueservice] = useState("");
  const hasSearchFilter = Boolean(filterValue);
  const hasSearchFilterservice = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
      if (visibleColumns === "all") return columns;

      return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  const headerColumnsservice = React.useMemo(() => {
    if (visibleColumnsService === "all") return columnsservice;

    return columnsservice.filter((columnsservice) => Array.from(visibleColumnsService).includes(columnsservice.uid));
}, [visibleColumnsService]);

  const filteredItems = React.useMemo(() => {
      let filteredCertificates = [...certificates];

      if (hasSearchFilter) {
          filteredCertificates = filteredCertificates.filter((certificate) =>
              certificate.certificateNo.toLowerCase().includes(filterValue.toLowerCase()) ||
              certificate.customerName.toLowerCase().includes(filterValue.toLowerCase())
          );
      }

      return filteredCertificates;
  }, [certificates, hasSearchFilter, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;

      return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
      return [...items].sort((a, b) => {
          const first = a[sortDescriptor.column as keyof Certificate];
          const second = b[sortDescriptor.column as keyof Certificate];
          const cmp = first < second ? -1 : first > second ? 1 : 0;

          return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });
  }, [sortDescriptor, items]);

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

  const onSearchChange = React.useCallback((value: string) => {
      if (value) {
          setFilterValue(value);
          setPage(1);
      } else {
          setFilterValue("");
      }
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
                  <span className="text-default-400 text-small">Total {certificates.length} certificates</span>
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
  }, [
      filterValue,
      statusFilter,
      visibleColumns,
      onRowsPerPageChange,
      certificates.length,
      onSearchChange,
  ]);



  const bottomContent = React.useMemo(() => {
      return (
          <div className="py-2 px-2 flex justify-between items-center">
              <span className="w-[30%] text-small text-default-400">

              </span>
              <Pagination
                  isCompact
                  // showControlsf
                  showShadow
                  color="success"
                  page={page}
                  total={pages}
                  onChange={setPage}
                  classNames={{
                      // base: "gap-2 rounded-2xl shadow-lg p-2 dark:bg-default-100",
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
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  const handleSelectionChange = (keys: Selection) => {
      if (keys === "all") {
          setSelectedKeys(new Set(certificates.map(cert => cert._id)));
      } else {
          setSelectedKeys(keys as Set<string>);
      }
  };

  const handleVisibleColumnsChange = (keys: Selection) => {
      setVisibleColumns(keys);
  };

  const renderCell = React.useCallback((certificate: Certificate, columnKey: string): React.ReactNode => {
      const cellValue = certificate[columnKey];

      if ((columnKey === "dateOfCalibration" || columnKey === "calibrationDueDate") && cellValue) {
          return formatDate(cellValue);
      }

      return cellValue;
  }, [isDownloading]);

  return (
    <SidebarProvider>
      <AppSidebar/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1"/>
            <ModeToggle/>
            <Separator orientation="vertical" className="mr-2 h-4"/>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block"/>
                <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/u">
                    User
                  </BreadcrumbLink>
                  </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block"/>
                <BreadcrumbItem>
                  <BreadcrumbPage>Data</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" ></div>
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col">
              <Card className="h-full flex flex-col bg-background rounded-lg border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center">Certificate Table</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table
                        isHeaderSticky
                        aria-label="Leads table with custom cells, pagination and sorting"
                        bottomContent={bottomContent}
                        bottomContentPlacement="outside"
                        classNames={{
                            wrapper: "max-h-[382px] ower-flow-y-auto",
                        }}
                        selectedKeys={selectedKeys}
                        sortDescriptor={sortDescriptor}
                        topContent={topContent}
                        topContentPlacement="outside"
                        onSelectionChange={handleSelectionChange}
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
                      <TableBody emptyContent={"No certificate found"} items={sortedItems}>
                        {(item) => (
                          <TableRow key={item._id}>
                              {(columnKey) => <TableCell style={{ fontSize: "12px", padding: "8px" }}>{renderCell(item as Certificate, columnKey as string)}</TableCell>}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col">
              <Card className="h-full flex flex-col bg-background rounded-lg border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center">Service Table</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table
                    isHeaderSticky
                    aria-label="Leads table with custom cells, pagination and sorting"
                    bottomContent={bottomContent}
                    bottomContentPlacement="outside"
                    classNames={{
                        wrapper: "max-h-[382px] ower-flow-y-auto",
                    }}
                    selectedKeys={selectedKeys}
                    sortDescriptor={sortDescriptor}
                    topContent={topContent}
                    topContentPlacement="outside"
                    onSelectionChange={handleSelectionChange}
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
                    <TableBody emptyContent={"No service found"} items={sortedItems}>
                      {(item) => (
                        <TableRow key={item._id}>
                          {(columnKey) => <TableCell style={{ fontSize: "12px", padding: "8px" }}>{renderCell(item as Service, columnKey as string)}</TableCell>}
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
