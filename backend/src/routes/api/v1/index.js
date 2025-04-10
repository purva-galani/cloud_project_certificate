const express = require("express");

const router = express.Router();

const certificateRoutes = require("./certificateRoutes");
const serviceRoutes = require("./serviceRoutes");
const userRoutes = require("./users.routs");
const adminRoutes = require("./admin.routs");
const addCategoryRoutes = require("./addcategory.routs");
const addEngineerRoutes = require("./addengineer.Router");
const companyRoutes = require("./company.router");
const contactPersonRoutes = require("./contactperson.routs");
const serviceEngineerRoutes = require("./serviceEngineerRouter");

router.use("/certificates", certificateRoutes);
router.use("/services", serviceRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/addcategory", addCategoryRoutes);
router.use("/engineers", addEngineerRoutes);
router.use("/company", companyRoutes);
router.use("/contactperson", contactPersonRoutes);
router.use("/ServiceEngineer", serviceEngineerRoutes);

module.exports = router;

