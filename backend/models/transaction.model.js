// models/transaction.model.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // This field is kept to distinguish between income and expense
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    // New fields from the modal form
    merchant: {
      type: String,
      default: "N/A",
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
    },
    tags: [String], // An array of strings
    notes: {
      type: String,
    },
    attachment: {
      type: String, // Stores the path to the uploaded file
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);