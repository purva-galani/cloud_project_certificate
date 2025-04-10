const mongoose = require("mongoose");
const { generateCertificateNumber } = require("../utils/certificateNumberGenerator");

const observationSchema = new mongoose.Schema({
    gas: { type: String },
    before: { type: String },
    after: { type: String }
}, { _id: false });

const certificateSchema = new mongoose.Schema({
    certificateId: { 
        type: String, 
        unique: true,
        default: () => `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        index: true
    },
    certificateNo: { 
        type: String, 
        unique: true,
        required: true,
        default: generateCertificateNumber
    },
    customerName: { type: String, required: true },
    siteLocation: { type: String, required: true },
    makeModel: { type: String, required: true },
    range: { type: String, required: true },
    serialNo: { type: String, required: true },
    calibrationGas: { type: String, required: true },
    gasCanisterDetails: { type: String, required: true },
    dateOfCalibration: { type: Date, required: true },
    calibrationDueDate: { type: Date, required: true },
    observations: { type: [observationSchema] }, 
    engineerName: { type: String, required: true },
    status: { type: String, required: true, default: "checked" }
}, {
    timestamps: true
});

const Certificate = mongoose.model("Certificate",certificateSchema)

module.exports = Certificate