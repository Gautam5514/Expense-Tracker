const express = require("express");
const router = express.Router();
const { getBudgets, createBudget } = require("../controllers/budget.controller");
const { protect } = require("../controllers/auth.controller");

// Protect all routes in this file
router.use(protect);

router.route("/")
    .get(getBudgets)
    .post(createBudget);

module.exports = router;