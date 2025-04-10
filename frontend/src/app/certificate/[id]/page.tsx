"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Define styles for PDF
const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 10 },
  section: { margin: 10, padding: 10 },
  label: { fontSize: 12, marginBottom: 5 },
  value: { fontSize: 14, marginBottom: 10 },
})

// PDF Document component
const CertificatePDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Calibration Certificate</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Customer Name:</Text>
        <Text style={styles.value}>{data.customerName}</Text>
        <Text style={styles.label}>Site Location:</Text>
        <Text style={styles.value}>{data.siteLocation}</Text>
        <Text style={styles.label}>Make & Model:</Text>
        <Text style={styles.value}>{data.makeModel}</Text>
        <Text style={styles.label}>Range:</Text>
        <Text style={styles.value}>{data.range}</Text>
        <Text style={styles.label}>Serial No.:</Text>
        <Text style={styles.value}>{data.serialNo}</Text>
        <Text style={styles.label}>Calibration Gas:</Text>
        <Text style={styles.value}>{data.calibrationGas}</Text>
        <Text style={styles.label}>Gas Canister Details:</Text>
        <Text style={styles.value}>{data.gasCanisterDetails}</Text>
        <Text style={styles.label}>Date of Calibration:</Text>
        <Text style={styles.value}>{data.dateOfCalibration}</Text>
        <Text style={styles.label}>Calibration Due Date:</Text>
        <Text style={styles.value}>{data.calibrationDueDate}</Text>
      </View>
    </Page>
  </Document>
)

export default function CertificatePDFPage() {
  const { id } = useParams()
  const [certificateData, setCertificateData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const response = await fetch(`/api/certificate/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch certificate data")
        }
        const data = await response.json()
        setCertificateData(data)
      } catch (error) {
        console.error("Error fetching certificate data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCertificateData()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!certificateData) {
    return <div className="text-center">Certificate not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Certificate PDF Generation</h1>
      <PDFDownloadLink document={<CertificatePDF data={certificateData} />} fileName={`certificate-${id}.pdf`}>
        {({ blob, url, loading, error }) => (
          <Button disabled={loading}>{loading ? "Generating PDF..." : "Download PDF"}</Button>
        )}
      </PDFDownloadLink>
    </div>
  )
}

