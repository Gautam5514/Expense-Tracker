const express = require("express");
const {
  getCategories,
  addCategory,
  deleteCategory,
} = require("../controllers/category.controller"); // Corrected path
const { protect } = require("../controllers/auth.controller"); // Corrected path
const router = express.Router();

router.use(protect); // This now works correctly

router.route("/").get(getCategories).post(addCategory);
router.route("/:id").delete(deleteCategory);

module.exports = router;