const mongoose = require("mongoose");

const engineerSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

const Addengineer = mongoose.model('engineers', engineerSchema);

module.exports = Addengineer;

