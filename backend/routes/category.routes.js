const express = require("express");
const {
  getCategories,
  addCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { protect } = require("../controllers/auth.controller"); 
const router = express.Router();

router.use(protect); 

router.route("/").get(getCategories).post(addCategory);
router.route("/:id").delete(deleteCategory);

module.exports = router;