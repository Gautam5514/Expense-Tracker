const express = require("express");
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller"); // Corrected path
const { protect } = require("../controllers/auth.controller"); // Corrected path
const router = express.Router();

router.use(protect);

router.route("/").get(getTransactions).post(addTransaction);
router.route("/:id").put(updateTransaction).delete(deleteTransaction);

module.exports = router;