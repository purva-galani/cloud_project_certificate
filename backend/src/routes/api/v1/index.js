const express = require("express");
const router = express.Router();

const adminRoutes = require("./admin.routs");
const userRoutes = require("./users.routs");
const companyRoutes = require("./company.router");
const contactPersonRoutes = require("./contactperson.routs");
const certificateRoutes = require("./certificateRoutes");
const serviceRoutes = require("./serviceRoutes");
const addCategoryRoutes = require("./addcategory.routs");
const addEngineerRoutes = require("./addengineer.Router");
const serviceEngineerRoutes = require("./serviceEngineerRouter");

router.use("/admin", adminRoutes);
router.use("/users", userRoutes);
router.use("/company", companyRoutes);
router.use("/contactperson", contactPersonRoutes);
router.use("/certificates", certificateRoutes);
router.use("/services", serviceRoutes);
router.use("/addcategory", addCategoryRoutes);
router.use("/engineers", addEngineerRoutes);
router.use("/ServiceEngineer", serviceEngineerRoutes);

module.exports = router;

