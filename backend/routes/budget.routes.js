// routes/budget.routes.js

const express = require("express");
const router = express.Router();
const { getBudgets, createBudget, updateBudget, deleteBudget } = require("../controllers/budget.controller");
const { protect } = require("../controllers/auth.controller");

router.use(protect);

router.route("/")
    .get(getBudgets)
    .post(createBudget);
    
router.route("/:id")
    .put(updateBudget)
    .delete(deleteBudget);

module.exports = router;