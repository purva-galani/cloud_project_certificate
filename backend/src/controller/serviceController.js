const path = require("path");
const fs = require("fs");
const generatePDFService = require("../utils/serviceGenerator");
const Service = require("../model/serviceModel");
const nodemailer = require("nodemailer");
const Users = require ("../model/user.model")

const getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ error: "Failed to fetch services" });
    }
};

const createService = async (req, res) => {
    try {
        console.log("Received request body:", req.body);

        const {
            customerName,
            customerLocation,
            contactPerson,
            contactNumber,
            serviceEngineer,
            date,
            place,
            placeOptions,
            natureOfJob,
            reportNo,
            makeModelNumberoftheInstrumentQuantity,
            serialNumberoftheInstrumentCalibratedOK,
            serialNumberoftheFaultyNonWorkingInstruments,
            engineerRemarks,
            engineerName,
            status
        } = req.body;

        // Validate required fields (including engineerRemarks structure)
        if (
            !customerName?.trim() ||
            !customerLocation?.trim() ||
            !contactPerson?.trim() ||
            !contactNumber?.trim() ||
            !serviceEngineer?.trim() ||
            !date ||
            !place?.trim() ||
            !placeOptions?.trim() ||
            !natureOfJob?.trim() ||
            !reportNo?.trim() ||
            !makeModelNumberoftheInstrumentQuantity?.trim() ||
            !serialNumberoftheInstrumentCalibratedOK?.trim() ||
            !serialNumberoftheFaultyNonWorkingInstruments?.trim() ||
            !engineerName?.trim() ||
            !status?.trim() ||
            !engineerRemarks || // Check if exists
            !Array.isArray(engineerRemarks) || // Must be an array
            engineerRemarks.length === 0 || // Must not be empty
            !engineerRemarks.every(remark => ( // Validate each remark
                remark.serviceSpares?.trim() &&
                remark.partNo?.trim() &&
                remark.rate?.trim() &&
                !isNaN(remark.quantity) && // quantity must be a number
                remark.poNo?.trim()
            ))
        ) 
        {
            return res.status(400).json({ 
                error: "All fields are required and engineer remarks must be properly structured" 
            });
        }

        // Proceed with saving data
        const newService = new Service({
            customerName: customerName.trim(),
            customerLocation: customerLocation.trim(),
            contactPerson: contactPerson.trim(),
            contactNumber: contactNumber.trim(),
            serviceEngineer: serviceEngineer.trim(),
            date: new Date(date),
            place: place.trim(),
            placeOptions: placeOptions.trim(),
            natureOfJob: natureOfJob.trim(),
            reportNo: reportNo.trim(),
            makeModelNumberoftheInstrumentQuantity: makeModelNumberoftheInstrumentQuantity.trim(),
            serialNumberoftheInstrumentCalibratedOK: serialNumberoftheInstrumentCalibratedOK.trim(),
            serialNumberoftheFaultyNonWorkingInstruments: serialNumberoftheFaultyNonWorkingInstruments.trim(),
            engineerRemarks: engineerRemarks.map(remark => ({
                serviceSpares: remark.serviceSpares.trim(),
                partNo: remark.partNo.trim(),
                rate: remark.rate.trim(),
                quantity: Number(remark.quantity), // Convert to number
                poNo: remark.poNo.trim()
            })),
            engineerName: engineerName.trim(),
            status: status.trim()
        });

        console.log("Saving service to database...");
        await newService.save();

        // Generate PDF (unchanged)
        const pdfPath = await generatePDFService(
            /* ... your existing PDF generation code ... */
        );

        res.status(201).json({
            message: "Service generated successfully!",
            serviceId: newService.serviceId,
            downloadUrl: `/api/v1/services/download/${newService.serviceId}`
        });
    } catch (error) {
        console.error("Service generation error:", error);
        res.status(500).json({ error: "Failed to generate service: " + error.message });
    }
};

const downloadService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        let service;
        if (/^[0-9a-fA-F]{24}$/.test(serviceId)) {
            service = await Service.findById(serviceId);
        } else {
            service = await Service.findOne({ serviceId });
        }

        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        const pdfPath = path.join(process.cwd(), "services", `${service.serviceId}.pdf`);

        if (!fs.existsSync(pdfPath)) {
            console.log("Attempting to regenerate PDF...");
            try {
                await generatePDFService(
                    service.customerName,
                    service.customerLocation,
                    service.contactPerson,
                    service.contactNumber,
                    service.serviceEngineer,
                    service.date,
                    service.place,
                    service.placeOptions,
                    service.natureOfJob,
                    service.reportNo,
                    service.makeModelNumberoftheInstrumentQuantity,
                    service.serialNumberoftheInstrumentCalibratedOK,
                    service.serialNumberoftheFaultyNonWorkingInstruments,
                    service.engineerRemarks,
                    service.engineerName,
                    service.status,
                    service.serviceId
                );
                console.log("PDF regenerated successfully");
            } catch (regenerateError) {
                console.error("Failed to regenerate PDF:", regenerateError);
                return res.status(500).json({ error: "Failed to regenerate PDF" });
            }
        }

        // Set proper headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=service-${service.serviceId}.pdf`);

        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);

    } catch (error) {
        console.error("Error downloading service:", error);
        res.status(500).json({ error: "Failed to download service: " + error.message });
    }
};

// Update service
const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const updateData = req.body;

        const service = await Service.findOne({ serviceId });

        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        // Validate fields if needed, and apply the updates
        Object.keys(updateData).forEach(key => {
            if (updateData[key] && updateData[key] !== service[key]) {
                service[key] = updateData[key];
            }
        });

        await service.save();

        // Generate new PDF after update
        const pdfPath = await generatePDFService(
            service.customerName,
            service.customerLocation,
            service.contactPerson,
            service.contactNumber,
            service.serviceEngineer,
            service.date,
            service.place,
            service.placeOptions,
            service.natureOfJob,
            service.reportNo,
            service.makeModelNumberoftheInstrumentQuantity,
            service.serialNumberoftheInstrumentCalibratedOK,
            service.serialNumberoftheFaultyNonWorkingInstruments,
            service.engineerRemarks,
            service.engineerName,
            service.status,
            service.serviceId
        );

        res.status(200).json({
            message: "Service updated successfully!",
            serviceId: service.serviceId,
            downloadUrl: `/api/v1/services/download/${service.serviceId}`
        });
    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({ error: "Failed to update service: " + error.message });
    }
};

// Delete service
const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;
        
        // Try finding by both _id and serviceId
        const service = await Service.findOne({
            $or: [
                { _id: serviceId },
                { serviceId: serviceId }
            ]
        });

        if (!service) {
            console.error(`Service not found for ID: ${serviceId}`);
            return res.status(404).json({ 
                error: "Service not found",
                details: `No service found with ID: ${serviceId}`
            });
        }

        // Delete PDF file if exists
        const pdfPath = path.join(process.cwd(), "services", `${service.serviceId}.pdf`);
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }

        // Delete from database
        await Service.deleteOne({ _id: service._id });

        res.status(200).json({ 
            message: "Service deleted successfully",
            deletedServiceId: service.serviceId
        });

    } catch (error) {
        console.error("Error in deleteService:", error);
        res.status(500).json({ 
            error: "Failed to delete service",
            systemError: error.message 
        });
    }
};


const getServiceById = async (req, res) => {
    try {
        const { serviceId } = req.params;

        // Try finding by both _id and serviceId
        let service;
        if (/^[0-9a-fA-F]{24}$/.test(serviceId)) {
            // If serviceId is in MongoDB ObjectId format
            service = await Service.findById(serviceId);
        } else {
            // If it's not in ObjectId format, try by serviceId field
            service = await Service.findOne({ serviceId });
        }

        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.status(200).json(service);
    } catch (error) {
        console.error("Error fetching service by ID:", error);
        res.status(500).json({ error: "Failed to fetch service by ID: " + error.message });
    }
};
const sendCertificateNotification = async (req, res) => {
    try {
        const { serviceId } = req.body;
        
        if (!serviceId) {
            return res.status(400).json({ error: "Service ID is required" });
        }

        // The user is now available from req.user (set by auth middleware)
        const user = req.user;
        if (!user) {
            return res.status(403).json({ error: "Authentication required" });
        }

        // Rest of your existing code...
        let service;
        if (/^[0-9a-fA-F]{24}$/.test(serviceId)) {
            service = await Service.findById(serviceId);
        } else {
            service = await Service.findOne({ serviceId });
        }

        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        const pdfPath = path.join(process.cwd(), "services", `${service.serviceId}.pdf`);
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ error: "PDF certificate not found" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const defaultRecipient = process.env.DEFAULT_NOTIFICATION_EMAIL;
        if (!defaultRecipient) {
            return res.status(400).json({ error: "Default notification email not configured" });
        }

        const mailOptions = {
            from: `"${user.email}"<${process.env.EMAIL_USER}>`,
            to: defaultRecipient,
            replyTo: user.email,
            subject: `Certificate Generated - ${service.serviceId}`,
            text: `A new certificate has been generated by ${user.name} (${user.email})...`,
            attachments: [{
                filename: `certificate-${service.serviceId}.pdf`,
                path: pdfPath
            }]
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: "Email sent successfully",
            sender: user.email,
            recipient: defaultRecipient
        });

    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ 
            error: "Failed to send email",
            details: error.message 
        });
    }
};  
// const sendCertificateNotification = async (req, res) => {
//     try {
//         const { serviceId } = req.body;

//         if (!serviceId) {
//             return res.status(400).json({ error: "Service ID is required" });
//         }

//         // Find the service
//         let service;
//         if (/^[0-9a-fA-F]{24}$/.test(serviceId)) {
//             service = await Service.findById(serviceId);
//         } else {
//             service = await Service.findOne({ serviceId });
//         }

//         if (!service) {
//             return res.status(404).json({ error: "Service not found" });
//         }

//         // Get the PDF path
//         const pdfPath = path.join(process.cwd(), "services", `${service.serviceId}.pdf`);

//         // Check if the PDF exists
//         if (!fs.existsSync(pdfPath)) {
//             return res.status(404).json({ error: "PDF certificate not found. Please generate it first." });
//         }

//         // Create transporter
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         const defaultRecipient = process.env.DEFAULT_NOTIFICATION_EMAIL;
//         if (!defaultRecipient) {
//             return res.status(400).json({ error: "Default notification email not configured" });
//         }

//         // Email options with attachment
//         const mailOptions = {
//             from: process.env.EMAIL_FROM,
//             to: defaultRecipient,
//             subject: `Certificate Generated - ${service.serviceId}`,
//             text: `A new certificate has been generated for ${service.customerName}.\n\n` +
//                   `Service ID: ${service.serviceId}\n` +
//                   `Customer: ${service.customerName}\n` +
//                   `Date: ${service.date.toDateString()}\n\n` +
//                   `Certificate is attached as a PDF.`,
//             attachments: [
//                 {
//                     filename: `certificate-${service.serviceId}.pdf`,
//                     path: pdfPath,
//                     contentType: 'application/pdf'
//                 }
//             ]
//         };

//         // Send the email
//         await transporter.sendMail(mailOptions);

//         res.status(200).json({
//             message: "Notification email with certificate sent successfully",
//             serviceId: service.serviceId,
//             recipient: defaultRecipient
//         });

//     } catch (error) {
//         console.error("Error sending notification email:", error);
//         res.status(500).json({
//             error: "Failed to send notification email",
//             details: error.message
//         });
//     }
// };


module.exports ={
    createService,
    getServices,
    downloadService,
    updateService,
    deleteService,
    getServiceById,
    sendCertificateNotification,
}