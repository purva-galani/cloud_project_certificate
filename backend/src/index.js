const express = require("express");
const connectDB = require("./db/connect");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const routes = require("./routes/api/v1/index");

const app = express();

// Ensure services directory exists
const servicesDir = path.join(process.cwd(), "services");
if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir);
    console.log("Created services directory");
}

// Configure CORS to accept requests from any origin during development
app.use(cors());

// Increase JSON payload limit for large requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

connectDB();

app.use("/api/v1", routes);

app.listen(5000, () => {
    console.log(`Server running on port 5000`);
});
