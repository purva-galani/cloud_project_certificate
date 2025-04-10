const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // const uri = process.env.MONGODB_URI || "mongodb+srv://morevishva1793:vishva2003@cluster0.6atfg.mongodb.net/certificate";
        const uri = process.env.MONGODB_URI || "mongodb+srv://purvagalani:root123@carmart1.te9rl.mongodb.net/cloud";

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        await mongoose.connect(uri, options);
        console.log("Connected to DB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); 
    }
}

module.exports = connectDB;