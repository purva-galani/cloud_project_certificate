const fs = require("fs");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const express = require("express");
const connectDB = require("./db/connect");
const bodyParser = require("body-parser");
const routes = require("./routes/api/v1/index");

const app = express();

const servicesDir = path.join(process.cwd(), "services");
if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir);
    console.log("Created services directory");
}

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

connectDB();

app.use("/api/v1", routes);

app.listen(5000, () => {
    console.log(`Server running on port 5000`);
});
