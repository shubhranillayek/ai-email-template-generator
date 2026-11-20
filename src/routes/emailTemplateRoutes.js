const express = require("express");
const {
  generateEmailTemplateHandler,
} = require("../controllers/emailTemplateController");

const router = express.Router();

router.post("/generate", generateEmailTemplateHandler);

module.exports = router;
