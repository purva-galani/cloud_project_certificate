const express = require("express");
const router = express.Router();
const ServiceEngineerController = require("../../../controller/serviceEngineer.controller");

router.post("/addServiceEngineer", ServiceEngineerController.addServiceEngineer);
router.get("/getServiceEngineers", ServiceEngineerController.getServiceEngineers);
router.delete("/deleteServiceEngineer/:id", ServiceEngineerController.deleteServiceEngineer);
router.put("/updateServiceEngineer/:id", ServiceEngineerController.updateServiceEngineer);

module.exports = router;