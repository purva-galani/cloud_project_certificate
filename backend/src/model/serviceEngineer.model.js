const mongoose = require("mongoose");

const engineerSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

const ServiceEngineer = mongoose.model('ServiceEngineer', engineerSchema);  

module.exports = ServiceEngineer;