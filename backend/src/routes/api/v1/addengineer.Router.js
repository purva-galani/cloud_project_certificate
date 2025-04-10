const express = require("express");
const router = express.Router();
const engineerController = require("../../../controller/addengineer.controller");

router.get("/getEngineers", engineerController.getEngineers);
router.post("/addEngineer", engineerController.addEngineer);
router.delete("/deleteEngineer/:id", engineerController.deleteEngineer);

module.exports = router;
