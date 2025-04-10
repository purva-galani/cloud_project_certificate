const express = require("express");
const router = express.Router();
const ServiceEngineerController = require("../../../controller/serviceEngineer.controller");


router.get("/getServiceEngineers", ServiceEngineerController.getServiceEngineers);
router.post("/addServiceEngineer", ServiceEngineerController.addServiceEngineer);
router.delete("/deleteServiceEngineer/:id", ServiceEngineerController.deleteServiceEngineer);
router.put("/updateServiceEngineer/:id", ServiceEngineerController.updateServiceEngineer);

module.exports = router;