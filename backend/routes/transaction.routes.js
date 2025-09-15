// routes/transaction.routes.js
const express = require("express");
const multer = require("multer");
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");
const { protect } = require("../controllers/auth.controller");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage: storage });


router.use(protect);

router
  .route("/")
  .get(getTransactions)
  .post(upload.single('attachment'), addTransaction);

router
  .route("/:id")
  .put(upload.single('attachment'), updateTransaction) 
  .delete(deleteTransaction);

module.exports = router;