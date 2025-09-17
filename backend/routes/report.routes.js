const express = require("express");
const router = express.Router();
const { getMonthlySummary, downloadPdfReport } = require("../controllers/report.controller");
const { protect } = require("../controllers/auth.controller");

// Protect all report routes
router.use(protect);

router.get("/monthly-summary", getMonthlySummary);
router.get("/monthly-summary/download-pdf", downloadPdfReport);

module.exports = router;