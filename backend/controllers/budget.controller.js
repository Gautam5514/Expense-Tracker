const Budget = require("../models/budget.model");
const Transaction = require("../models/transaction.model");

// GET all budgets with their current spending
// GET all budgets with their current spending
exports.getBudgets = async (req, res) => {
    try {
        const userId = req.user.id;

        // We are removing the date filter for now to make your sample data work.
        // const now = new Date();
        // const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // 1. Find all budgets for the user
        const budgets = await Budget.find({ user: userId }).lean();

        // 2. Use an aggregation pipeline to calculate total spending per category
        const spendingByCategory = await Transaction.aggregate([
            {
                // THIS IS THE CORRECTED PART: We only match by user and type.
                // The date filter has been removed.
                $match: {
                    user: userId,
                    type: 'expense',
                },
            },
            {
                $group: {
                    _id: { $toLower: '$category' }, // Group by lowercase category for consistency
                    totalSpent: { $sum: '$amount' }, // Sum the amounts
                },
            },
        ]);

        // 3. Create a map for quick lookup of spending
        const spendingMap = spendingByCategory.reduce((acc, item) => {
            acc[item._id] = item.totalSpent;
            return acc;
        }, {});

        // 4. Combine the budget limits with the actual spending
        const budgetsWithSpent = budgets.map(budget => ({
            ...budget,
            spent: spendingMap[budget.category.toLowerCase()] || 0, // Look up using lowercase
        }));

        res.status(200).json({ data: { budgets: budgetsWithSpent } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// CREATE a new budget
exports.createBudget = async (req, res) => {
    try {
        const { category, limit } = req.body;
        if (!category || !limit) {
            return res.status(400).json({ message: "Category and limit are required." });
        }
        const newBudget = await Budget.create({
            user: req.user.id,
            category,
            limit,
        });
        res.status(201).json({ data: { budget: newBudget } });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: "A budget for this category already exists." });
        }
        res.status(500).json({ error: error.message });
    }
};
// Add update/delete functions as needed