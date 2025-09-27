
const Budget = require("../models/budget.model");
const Transaction = require("../models/transaction.model");

exports.getBudgets = async (req, res) => {
    try {
        const userId = req.user.id;

        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const budgets = await Budget.find({ user: userId }).lean();

        if (budgets.length === 0) {
            return res.status(200).json({ data: { budgets: [] } });
        }

        const spendingByCategory = await Transaction.aggregate([
            {
                $match: {
                    user: req.user._id,
                    type: 'expense',
                    date: { $gte: startDate, $lte: endDate }
                },
            },
            {
                $group: {
                    _id: '$category',
                    totalSpent: { $sum: '$amount' },
                },
            },
        ]);

        // 3. Create a map for quick lookup (e.g., { "Groceries": 2000 })
        const spendingMap = spendingByCategory.reduce((acc, item) => {
            acc[item._id.toLowerCase()] = item.totalSpent;
            return acc;
        }, {});

        // 4. Combine budget limits with the calculated monthly spending
        const budgetsWithSpent = budgets.map(budget => ({
            ...budget,
            spent: spendingMap[budget.category.toLowerCase()] || 0,
        }));

        res.status(200).json({ data: { budgets: budgetsWithSpent } });
    } catch (error) {
        console.error("Error fetching budgets:", error);
        res.status(500).json({ error: error.message });
    }
};

// CREATE function remains the same, it's correct.
exports.createBudget = async (req, res) => {
    try {
        const { category, limit } = req.body;
        if (!category || limit === undefined) {
            return res.status(400).json({ message: "Category and limit are required." });
        }
        const newBudget = await Budget.create({
            user: req.user.id,
            category,
            limit,
        });
        res.status(201).json({ data: { budget: newBudget } });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "A budget for this category already exists." });
        }
        res.status(500).json({ error: error.message });
    }
};

// --- NEW: Function to UPDATE a budget's limit ---
exports.updateBudget = async (req, res) => {
    try {
        const { limit } = req.body;
        if (limit === undefined || parseFloat(limit) < 0) {
            return res.status(400).json({ message: "A valid, non-negative limit is required." });
        }

        const budget = await Budget.findOneAndUpdate(
            // Condition: Find the budget by ID AND make sure it belongs to the logged-in user
            { _id: req.params.id, user: req.user.id },
            // Update: Set the new limit
            { $set: { limit: parseFloat(limit) } },
            // Options: Return the newly updated document
            { new: true }
        );

        if (!budget) {
            return res.status(404).json({ message: "Budget not found or you do not have permission to edit it." });
        }

        res.status(200).json({ data: { budget } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- NEW: Function to DELETE a budget ---
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id // Security: Ensures users can only delete their own budgets
        });

        if (!budget) {
            return res.status(404).json({ message: "Budget not found." });
        }

        // 204 No Content is the standard response for a successful deletion
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};