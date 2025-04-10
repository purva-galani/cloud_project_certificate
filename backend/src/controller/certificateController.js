const Certificate = require("../model/certificateModel");
const generatePDF = require("../utils/pdfGenerator");
const path = require("path");
const fs = require("fs");

const getCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.find({})
        res.status(200).json({
            success: true,
            data: certificate
        })
    } catch (error) {
        console.error("Error fetching Certificates:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
}

const getCertificatById = async (req, res) => {
    const { certificateId } = req.params;
    try {
        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found"
            });
        }
        res.status(200).json({
            success: true,
            data: certificate,
        });
    } catch (error) {
        console.error("Error fetching Certificate:", error);
        res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`,
        });
    }
};

const createCertificate = async (req, res) => {
    try {
        console.log("Received request body:", req.body);
        const {
            customerName,
            siteLocation,
            makeModel,
            range,
            serialNo,
            calibrationGas,
            gasCanisterDetails,
            dateOfCalibration,
            calibrationDueDate,
            observations,
            engineerName,
            status
        } = req.body;

        // Validate required fields
        if (!customerName || !siteLocation || !makeModel || !range || !serialNo ||
            !calibrationGas || !gasCanisterDetails || !dateOfCalibration ||
            !calibrationDueDate || !observations || observations.length === 0 || !engineerName || !status) {
            console.error("Missing required fields");
            return res.status(400).json({ error: "All fields and at least one observation are required" });
        }

        const newCertificate = new Certificate({
            customerName,
            siteLocation,
            makeModel,
            range,
            serialNo,
            calibrationGas,
            gasCanisterDetails,
            dateOfCalibration: new Date(dateOfCalibration),
            calibrationDueDate: new Date(calibrationDueDate),
            observations,
            engineerName,
            status
        });

        console.log("Saving certificate to database...");
        await newCertificate.save();
        console.log("Certificate saved successfully");

        console.log("Generating PDF...");
        const pdfPath = await generatePDF(
            newCertificate.certificateNo,
            customerName,
            siteLocation,
            makeModel,
            range,
            serialNo,
            calibrationGas,
            gasCanisterDetails,
            dateOfCalibration,
            calibrationDueDate,
            newCertificate.certificateId,
            observations,
            engineerName,
            status
        );
        console.log("PDF generated successfully at:", pdfPath);

        res.status(201).json({
            message: "Certificate generated successfully!",
            certificateId: newCertificate.certificateId,
            downloadUrl: `/api/v1/certificates/download/${newCertificate.certificateId}`
        });
    } catch (error) {
        console.error("Certificate generation error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Failed to generate certificate: " + error.message });
    }
};

const downloadCertificate = async (req, res) => {
    try {
        console.log("Received request params:", req.params);
        const { certificateId } = req.params;

        // Find certificate by certificateId field, not _id
        const certificate = await Certificate.findOne({ certificateId: certificateId });
        if (!certificate) {
            console.error(`Certificate not found in database: ${certificateId}`);
            return res.status(404).json({ error: "Certificate not found in database" });
        }

        // Check if the PDF exists
        const pdfPath = path.join(process.cwd(), "certificates", `${certificateId}.pdf`);
        console.log("Looking for PDF at path:", pdfPath);

        if (!fs.existsSync(pdfPath)) {
            console.error(`Certificate file not found at path: ${pdfPath}`);
            
            // Try to regenerate the PDF
            console.log("Attempting to regenerate PDF...");
            try {
                await generatePDF(
                    certificate.certificateNo,
                    certificate.customerName,
                    certificate.siteLocation,
                    certificate.makeModel,
                    certificate.range,
                    certificate.serialNo,
                    certificate.calibrationGas,
                    certificate.gasCanisterDetails,
                    certificate.dateOfCalibration,
                    certificate.calibrationDueDate,
                    certificate.certificateId,  // Use certificateId from the certificate
                    certificate.observations,
                    certificate.engineerName,
                    certificate.status
                );
                console.log("PDF regenerated successfully");
            } catch (regenerateError) {
                console.error("Failed to regenerate PDF:", regenerateError);
                return res.status(500).json({ error: "Failed to regenerate certificate PDF" });
            }

            // Check again if the file exists after regeneration
            if (!fs.existsSync(pdfPath)) {
                return res.status(404).json({ error: "Certificate file could not be generated" });
            }
        }

        console.log("Setting response headers...");
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateNo}.pdf`);

        console.log("Creating read stream...");
        const stream = fs.createReadStream(pdfPath);
        stream.on('error', function (error) {
            console.error("Error streaming certificate:", error);
            console.error("Error stack:", error.stack);
            res.status(500).json({ error: "Failed to download certificate: " + error.message });
        });

        console.log("Piping stream to response...");
        stream.pipe(res);
    } catch (error) {
        console.error("Certificate download error:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ error: "Failed to download certificate: " + error.message });
    }
};

const updateCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const updateData = req.body;
        
        const certificate = await Certificate.findByIdAndUpdate(
            certificateId,
            updateData,
            { new: true }
        );

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found"
            });
        }

        res.status(200).json({
            success: true,
            data: certificate,
            message: "Certificate updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;
        
        const certificate = await Certificate.findByIdAndDelete(certificateId);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Certificate deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createCertificate,
    getCertificate,
    updateCertificate,
    deleteCertificate,
    getCertificatById,
    downloadCertificate
};