const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    gstNumber: { type: String, required: true },
    industries: { type: String, required: true },
    website: { type: String, required: true },
    industriesType: { type: String, required: true },
    flag: { type: String, required: true },
}, {
    timestamps: true
});

const Company = mongoose.model("CompanyDetails", companySchema)

module.exports = Company