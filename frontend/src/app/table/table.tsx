"use client"

import {
  Table,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, FileDown } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Certificate = {
  _id: string;
  certificateNo: String,
  customerName: String,
  siteLocation: String,
  makeModel: String,
  range: String,
  serialNo: String,
  calibrationGas: String,
  gasCanisterDetails: String,
  dateOfCalibration: Date,
  calibrationDueDate: Date,
  observations: Observation[],
  engineerName: String
}

interface CertificateTableProps {
  initialData: Certificate[];
}

export default function CertificateTable({ initialData }: CertificateTableProps) {
  const router = useRouter()
  const [certificatesData, setCertificatesData] = useState<Certificate[]>(initialData)

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/deleteCertificate/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted certificate from the state
        setCertificatesData(prev => prev.filter(cert => cert._id !== id));
      } else {
        console.error('Failed to delete:', data.message);
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/certificate/edit/${id}`);
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/certificates/getCertificate")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCertificatesData(data.data);
        } else {
          console.error("Invalid data format received:", data);
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <Table>
      <TableCaption>Certificates List</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Customer Name</TableHead>
          <TableHead>Site Location</TableHead>
          <TableHead>Make/Model</TableHead>
          <TableHead>Range</TableHead>
          <TableHead>Serial No.</TableHead>
          <TableHead>Calibration Gas</TableHead>
          <TableHead>Gas Canister Details</TableHead>
          <TableHead>Date of Calibration</TableHead>
          <TableHead>Calibration Due Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {certificatesData && certificatesData.length > 0 ? (
          certificatesData.map((certificate) => (
            <TableRow key={certificate._id}>
              <TableCell>{certificate.customerName}</TableCell>
              <TableCell>{certificate.siteLocation}</TableCell>
              <TableCell>{certificate.makeModel}</TableCell>
              <TableCell>{certificate.range}</TableCell>
              <TableCell>{certificate.serialNo}</TableCell>
              <TableCell>{certificate.calibrationGas}</TableCell>
              <TableCell>{certificate.gasCanisterDetails}</TableCell>
              <TableCell>{new Date(certificate.dateOfCalibration).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(certificate.calibrationDueDate).toLocaleDateString()}</TableCell>
              <TableCell className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleEdit(certificate._id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this certificate?')) {
                      handleDelete(certificate._id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <FileDown className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={10} className="text-center">
              No data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}