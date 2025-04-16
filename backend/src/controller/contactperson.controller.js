const ContactPerson = require("../model/contact.model");

const getContactPerson = async (req, res) => {
    try {
        const contactPersons = await ContactPerson.find({});
        res.status(200).json({
            success: true,
            data: contactPersons
        });
    } catch (error) {
        console.error("Error fetching contact persons:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const getContactPersonById = async (req, res) => {
    try {
        const contactPerson = await ContactPerson.findById(req.params.id);
        if (!contactPerson) {
            return res.status(404).json({
                success: false,
                message: "Contact person not found"
            });
        }
        res.status(200).json({
            success: true,
            data: contactPerson
        });
    } catch (error) {
        console.error("Error fetching contact person:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const createContactPerson = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            contactNo,
            email,
            designation
        } = req.body;
        if (!firstName || !lastName || !contactNo || !email || !designation) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, contact number, email and designation are required"
            });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
        const newContactPerson = new ContactPerson({
            firstName,
            middleName: middleName || '',
            lastName,
            contactNo,
            email,
            designation
        });
        await newContactPerson.save();
        res.status(201).json({
            success: true,
            message: "Contact person created successfully",
            data: newContactPerson
        });
    } catch (error) {
        console.error("Contact person creation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create contact person: " + error.message
        });
    }
};

const updateContactPerson = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        delete updateData._id;
        delete updateData.__v;
        const updatedContactPerson = await ContactPerson.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        if (!updatedContactPerson) {
            return res.status(404).json({
                success: false,
                message: "Contact person not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Contact person updated successfully",
            data: updatedContactPerson
        });
    } catch (error) {
        console.error("Error updating contact person:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

const deleteContactPerson = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedContactPerson = await ContactPerson.findByIdAndDelete(id);
        if (!deletedContactPerson) {
            return res.status(404).json({
                success: false,
                message: "Contact person not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Contact person deleted successfully",
            data: {
                id: deletedContactPerson._id,
                name: `${deletedContactPerson.firstName} ${deletedContactPerson.lastName}`
            }
        });
    } catch (error) {
        console.error("Error deleting contact person:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
        });
    }
};

module.exports = {
    getContactPerson,
    getContactPersonById,
    createContactPerson,
    updateContactPerson,
    deleteContactPerson
};