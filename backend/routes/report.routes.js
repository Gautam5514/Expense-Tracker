const express = require("express");
const router = express.Router();
const { getMonthlySummary } = require("../controllers/report.controller");
const { protect } = require("../controllers/auth.controller");

// Protect all report routes
router.use(protect);

router.get("/monthly-summary", getMonthlySummary);

module.exports = router;