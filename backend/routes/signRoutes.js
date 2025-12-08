const express = require("express");
const router = express.Router();
const signController = require("../controller/signController");

router.post("/sign-pdf", signController.signPdf);

module.exports = router;
