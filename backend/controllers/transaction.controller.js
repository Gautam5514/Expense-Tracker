// controllers/transaction.controller.js
const Transaction = require("../models/transaction.model");
const Budget = require("../models/budget.model"); 
const { predictCategory } = require("../utils/aiCategorizer");


exports.getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build base query
        const query = { user: userId };

        // --- NEW: Add optional date filtering ---
        if (req.query.year && req.query.month) {
            const year = parseInt(req.query.year);
            const month = parseInt(req.query.month);
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);
            query.date = { $gte: startDate, $lte: endDate };
        }
        // --- END NEW ---
        
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const totalResults = await Transaction.countDocuments(query);
            
        res.status(200).json({ 
            results: transactions.length,
            total: totalResults,
            data: { transactions }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.addTransaction = async (req, res) => {
  try {
    let { category, merchant, notes } = req.body;

    // ✅ If user didn't choose a category, let AI guess it
    if (!category || category.trim() === "") {
      const combinedText = `${merchant || ""} ${notes || ""}`;
      category = await predictCategory(combinedText);
      req.body.category = category;
    }

    // ✅ Auto-create budget if not exists
    if (category) {
      await Budget.findOneAndUpdate(
        {
          user: req.user.id,
          category: { $regex: new RegExp(`^${category}$`, "i") },
        },
        {
          $setOnInsert: {
            user: req.user.id,
            category: category,
            limit: 0,
          },
        },
        { upsert: true }
      );
    }

    // ✅ Create new transaction
    const newTransactionData = {
      ...req.body,
      user: req.user.id,
      type: "expense",
      tags: req.body.tags
        ? req.body.tags.split(",").map((tag) => tag.trim())
        : [],
    };

    if (req.file) {
      newTransactionData.attachment = req.file.path;
    }

    const transaction = await Transaction.create(newTransactionData);
    res.status(201).json({ data: { transaction } });
  } catch (error) {
    console.error("Add Transaction Error:", error);
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