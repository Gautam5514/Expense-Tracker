
const express = require("express");
const {
  getCategories,
  addCategory,
  deleteCategory,
  updateCategoryName, // --- IMPORT the new function ---
} = require("../controllers/category.controller");
const { protect } = require("../controllers/auth.controller"); 
const router = express.Router();

router.use(protect); 

router.route("/")
    .get(getCategories)
    .post(addCategory);

// --- NEW ROUTE for renaming ---
router.route("/update-name").put(updateCategoryName);

router.route("/:id")
    .delete(deleteCategory);

module.exports = router;