const express = require("express");
const { CertificateController } = require("../../../controller");

const router = express.Router();

router.post(
    "/generateCertificate",
    CertificateController.createCertificate
);
router.get(
    "/getCertificate",
    CertificateController.getCertificate
);
router.get(
    "/getCertificateByid/:certificateId",
    CertificateController.getCertificatById
);
router.get(
    "/download/:certificateId",
    CertificateController.downloadCertificate
);
router.put(
    "/updateCertificate/:certificateId",
    CertificateController.updateCertificate
);
router.delete(
    "/deleteCertificate/:certificateId",
    CertificateController.deleteCertificate
);

module.exports = router;