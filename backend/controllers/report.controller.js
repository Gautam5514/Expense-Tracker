const Transaction = require("../models/transaction.model");

exports.getMonthlySummary = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get year and month from query params, default to current year/month
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;

        // Calculate start and end dates for the selected month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // --- 1. Calculate Summary Stats (Income, Spending, Savings) ---
        const summaryAggregation = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$type', // Group by 'income' or 'expense'
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const summary = {
            totalIncome: summaryAggregation.find(s => s._id === 'income')?.total || 0,
            totalSpending: summaryAggregation.find(s => s._id === 'expense')?.total || 0,
        };
        summary.netSavings = summary.totalIncome - summary.totalSpending;

        // --- 2. Calculate Spending by Category (for Pie Chart) ---
        const spendingByCategory = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$category', value: { $sum: '$amount' } } },
            { $project: { _id: 0, name: '$_id', value: '$value' } }, // Rename fields for Recharts
            { $sort: { value: -1 } } // Sort by highest value
        ]);

        // --- 3. Calculate Spending Over Time (for Line Chart) ---
        const spendingOverTime = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' }, // Group by the day of the month
                    spending: { $sum: '$amount' }
                }
            },
            { $project: { _id: 0, day: '$_id', spending: '$spending' } },
            { $sort: { day: 1 } } // Sort by day
        ]);

        res.status(200).json({
            data: {
                summary,
                spendingByCategory,
                spendingOverTime,
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};