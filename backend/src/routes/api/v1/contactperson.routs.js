const express = require("express");
const router = express.Router();
const { ContactPersonController } = require("../../../controller");

router.post(
    "/generateContactPerson",
    ContactPersonController.createContactPerson
);
router.get(
    "/getContactPersons",
    ContactPersonController.getContactPerson
);
router.get(
    "/getContactPersonByid/:id",
    ContactPersonController.getContactPersonById
);
router.put(
    "/updateContactPerson/:id",
    ContactPersonController.updateContactPerson
);
router.delete(
    "/deleteContactPerson/:id",
    ContactPersonController.deleteContactPerson
);

module.exports = router;