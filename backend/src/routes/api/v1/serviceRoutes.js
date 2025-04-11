const express = require("express");
const { ServiceController } = require("../../../controller");
const authenticate = require('../../../middleware/auth');
const { sendCertificateNotification } = require('../../../controller/serviceController');

const router = express.Router();

router.get(
    "/getServices", 
    ServiceController.getServices
);

router.post(
    "/generateServices", 
    ServiceController.createService
);

router.get(
    "/download/:serviceId", 
    ServiceController.downloadService
);

router.put(
    "/update/:serviceId", 
    ServiceController.updateService
);

router.delete(
    "/deleteService/:serviceId", 
    ServiceController.deleteService
);


router.get("/getServiceById/:serviceId", 
    ServiceController.getServiceById);


    router.post('/sendMail', authenticate, sendCertificateNotification);

    module.exports = router;