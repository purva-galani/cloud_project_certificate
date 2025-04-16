const express = require("express");
const router = express.Router();
const companyController = require("../../../controller/company.controller");

router.post("/createcompany", companyController.createCompany);
router.get("/getAllcompanies", companyController.getAllCompanies);
router.get("/getcompanyById/:id", companyController.getCompanyById);
router.put("/updatecompany/:id", companyController.updateCompany);
router.delete("/deletecompany/:id", companyController.deleteCompany);

module.exports = router;
