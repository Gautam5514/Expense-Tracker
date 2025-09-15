// controllers/transaction.controller.js
const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model"); 


exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ results: transactions.length, data: { transactions } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.addTransaction = async (req, res) => {
  try {
    // Get the category from the request body. We need it for the budget check.
    const { category } = req.body;

    // <-- 2. ADD THIS ENTIRE BLOCK for auto-creating budgets
    // This logic runs before creating the transaction.
    if (category) {
      await Budget.findOneAndUpdate(
        // Condition: Find a budget for this user with this category (case-insensitive)
        { 
          user: req.user.id, 
          category: { $regex: new RegExp(`^${category}$`, 'i') } 
        },
        // Update: If it's not found, set these values on insert ($setOnInsert)
        { 
          $setOnInsert: { 
            user: req.user.id, 
            category: category, 
            limit: 0 // Default limit for auto-created budgets
          } 
        },
        // Options: 'upsert: true' means CREATE the document if it doesn't exist
        { upsert: true }
      );
    }
    // END OF THE NEW BLOCK

    // The rest of your function continues exactly as before
    const newTransactionData = {
      ...req.body,
      user: req.user.id,
      type: 'expense', 
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
    };

    if (req.file) {
      newTransactionData.attachment = req.file.path;
    }

    const transaction = await Transaction.create(newTransactionData);

    res.status(201).json({ data: { transaction } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.updateTransaction = async (req, res) => {
  try {
    const updateData = { ...req.body };

  
    if (updateData.tags && typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

  
    if (req.file) {
      updateData.attachment = req.file.path;
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "No transaction found with that ID for this user" });
    }

    res.status(200).json({ data: { transaction } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ message: "No transaction found with that ID for this user" });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};