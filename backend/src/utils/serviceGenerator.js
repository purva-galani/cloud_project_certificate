const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const generatePDFService = async (
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
    status,
    serviceId
) => {
    if (!engineerRemarks || !Array.isArray(engineerRemarks)) {
        engineerRemarks = [];
    }
    const doc = new PDFDocument({
        layout: 'portrait',
        size: 'A4',
        margins: { top: 40, left: 50, right: 50, bottom: 40 }
    });
    const servicesDir = path.join(process.cwd(), "services");
    if (!fs.existsSync(servicesDir)) {
        fs.mkdirSync(servicesDir);
    }
    const fileName = path.join(servicesDir, `${serviceId}.pdf`);
    doc.pipe(fs.createWriteStream(fileName));
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');
    const pageHeight = doc.page.height;
    const margin = 35;
    const logoPath = path.join(process.cwd(), 'src', 'assets', 'rps.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin + 0, margin + 10, { width: 175, height: 50 });
    }
    const topMargin = 140;
    const headPath = path.join(process.cwd(), 'src', 'assets', 'handf.png');
    if (fs.existsSync(headPath)) {
        doc.image(headPath, margin + 0, topMargin, { width: 526, height: 50 });
    }
    const column1X = margin + 10;
    const column2X = 250;
    const startY = 180;
    const lineHeight = 20;
    let y = startY;
    doc.moveDown(3);
    doc.y = 200;
    doc.fontSize(16)
        .fillColor('#1a237e')
        .text('SERVICE / CALIBRATION / INSTALLATION  JOBREPORT', { align: 'center', underline: true })
        .moveDown(2);
    doc.y = 230;
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Customer Name: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(customerName)
        .moveDown(2);
    doc.y = 250;
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Customer Location: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(customerLocation)
        .moveDown(2);
    doc.y = 270;
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Contact Person: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(contactPerson)
        .moveDown(2);
    doc.y = 290
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Status: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(status)
        .moveDown(2);
    doc.y = 310
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Contact Number: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(contactNumber)
        .moveDown(2);
    doc.y = 330
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Service Engineer: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(serviceEngineer)
        .moveDown(2);
    doc.y = 350
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Date: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(date)
        .moveDown(2);
    doc.y = 370
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Place: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(place)
        .moveDown(2);
    doc.y = 390
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Place Options: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(placeOptions)
        .moveDown(2);
    doc.y = 410
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Nature of Job: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(natureOfJob)
        .moveDown(2);
    doc.y = 430
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Report No.: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(reportNo)
        .moveDown(2);
    doc.y = 450
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Make & Model Number: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(makeModelNumberoftheInstrumentQuantity)
        .moveDown(2);
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Calibrated & Tested OK: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(serialNumberoftheInstrumentCalibratedOK)
        .moveDown(2);
    doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text('Sr.No Faulty/Non-Working: ', margin + 10, doc.y, { continued: true });
    doc.font('Helvetica')
        .text(serialNumberoftheFaultyNonWorkingInstruments)
        .moveDown(2);
    doc.fontSize(10)
    doc.y = 800;
    doc.font('Helvetica-Bold')
        .fillColor('#000')
        .text('ENGINEER REMARKS', { align: 'left', underline: true })
        .moveDown(2);
    const tableTop = doc.y;
    const tableLeft = margin + 10;
    const colWidths = [40, 165, 60, 80, 70, 85];
    const rowHeight = 20;
    doc.fillColor('#000')
        .rect(tableLeft, tableTop, colWidths[0], rowHeight).stroke()
        .rect(tableLeft + colWidths[0], tableTop, colWidths[1], rowHeight).stroke()
        .rect(tableLeft + colWidths[0] + colWidths[1], tableTop, colWidths[2], rowHeight).stroke()
        .rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop, colWidths[3], rowHeight).stroke()
        .rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop, colWidths[4], rowHeight).stroke()
        .rect(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop, colWidths[5], rowHeight).stroke();
    doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#000')
        .text('Sr. No.', tableLeft + 6, tableTop + 6)
        .text('Service/Spares', tableLeft + colWidths[0] + 6, tableTop + 6)
        .text('Part No.', tableLeft + colWidths[0] + colWidths[1] + 6, tableTop + 6)
        .text('Rate', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 6, tableTop + 6)
        .text('Quantity', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 6, tableTop + 6)
        .text('PO No.', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 6, tableTop + 6);
    doc.fillColor('#000');
    engineerRemarks.forEach((remark, index) => {
        const rowY = tableTop + rowHeight + (index * rowHeight);
        let currentX = tableLeft;
        colWidths.forEach(width => {
            doc.rect(currentX, rowY, width, rowHeight).stroke();
            currentX += width;
        });
        doc.font('Helvetica')
            .text((index + 1).toString(), tableLeft + 6, rowY + 6)
            .text(remark.serviceSpares, tableLeft + colWidths[0] + 6, rowY + 6)
            .text(remark.partNo, tableLeft + colWidths[0] + colWidths[1] + 6, rowY + 6)
            .text("Rs" + " " + remark.rate + " " + "/-", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + 6, rowY + 6)
            .text(remark.quantity, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 6, rowY + 6)
            .text(remark.poNo, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 6, rowY + 6);
    });
    doc.moveDown(3);
    const bottomMargin = 80;
    const signatureMargin = 20;
    doc.fontSize(12)
        .text('Service Engineer', doc.page.width - margin - 140, doc.y - signatureMargin)
        .text(engineerName, doc.page.width - margin - 120, doc.y - signatureMargin + 20)
        .moveDown(4);
    const footerPosition = doc.page.height - bottomMargin - 70;
    doc.fontSize(12)
        .text(`Generated on: ${new Date().toLocaleString()}`, margin + 10, footerPosition + 15);
    const footerMargin = 85;
    const footerPath = path.join(process.cwd(), 'src', 'assets', 'handf.png');
    if (fs.existsSync(footerPath)) {
        doc.image(footerPath, margin + 0, doc.page.height - footerMargin, { width: 526, height: 50 });
    }
    doc.end();
    return fileName;
};

module.exports = generatePDFService;
