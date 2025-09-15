const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    limit: {
        type: Number,
        required: [true, "Budget limit is required"],
        min: [0, "Limit cannot be negative"],
    },
}, { timestamps: true });

// Ensure a user cannot have two budgets for the same category
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);