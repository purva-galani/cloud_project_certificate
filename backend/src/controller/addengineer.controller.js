const Engineer = require("../model/addengineer.model");
const mongoose = require("mongoose");

// Get all engineers
const getEngineers = async (req, res) => {
    try {
        const engineers = await Engineer.find();
        res.json(engineers);
    } catch (error) {
        res.status(500).json({ error: "Error fetching engineers" });
    }
};

// Add new engineer
const addEngineer = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Engineer name is required" });

        const newEngineer = new Engineer({ name });
        await newEngineer.save();
        res.status(201).json({ message: "Engineer added successfully", id: newEngineer._id });
    } catch (error) {
        res.status(500).json({ error: "Error adding engineer" });
    }
};

// Delete engineer
const deleteEngineer = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEngineer = await Engineer.findByIdAndDelete(id);
        if (!deletedEngineer) return res.status(404).json({ error: "Engineer not found" });

        res.json({ message: "Engineer deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting engineer" });
    }
};
 module.exports = {
    getEngineers,
    addEngineer,
    deleteEngineer,
 }
