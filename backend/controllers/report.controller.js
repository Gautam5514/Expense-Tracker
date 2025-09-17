const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');

exports.getMonthlySummary = async (req, res) => {
    try {
        const userId = req.user._id;

        // --- NEW: Fetch the full user document to get their financial profile ---
        const currentUser = await User.findById(userId);
        
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // This part remains the same, it correctly calculates total spending
        const summaryAggregation = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // --- MODIFIED: The summary object now uses the user's stored income ---
        const summary = {
            // Use the monthlyIncome from the user's profile. Default to 0 if not set.
            totalIncome: currentUser.financialProfile?.monthlyIncome || 0,
            totalSpending: summaryAggregation.length > 0 ? summaryAggregation[0].total : 0,
        };
        summary.remainingBalance = summary.totalIncome - summary.totalSpending;

        // --- 2. Spending by Category ---
        const spendingByCategory = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: '$category', value: { $sum: '$amount' } } },
            { $project: { _id: 0, name: '$_id', value: '$value' } },
            { $sort: { value: -1 } }
        ]);

        // --- 3. Spending Over Time ---
        const spendingOverTime = await Transaction.aggregate([
            { $match: { user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: { $dayOfMonth: '$date' }, spending: { $sum: '$amount' } } },
            { $project: { _id: 0, day: '$_id', spending: '$spending' } },
            { $sort: { day: 1 } }
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
exports.downloadPdfReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth() + 1;

        // 1. Fetch User and Transaction Data
        const currentUser = await User.findById(userId);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const expenses = await Transaction.find({ user: userId, type: 'expense', date: { $gte: startDate, $lte: endDate } }).sort({ amount: -1 }).lean();

        // 2. Calculate All Metrics and Insights
        const summary = {
            totalIncome: currentUser.financialProfile?.monthlyIncome || 0,
            totalSpending: expenses.reduce((sum, tx) => sum + tx.amount, 0),
        };
        summary.remainingBalance = summary.totalIncome - summary.totalSpending;
        
        // Group spending by category
        let spendingByCategory = expenses.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {});
        spendingByCategory = Object.entries(spendingByCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        // Group spending by day
        let spendingOverTime = expenses.reduce((acc, tx) => {
            const day = new Date(tx.date).getDate();
            acc[day] = (acc[day] || 0) + tx.amount;
            return acc;
        }, {});
        spendingOverTime = Object.entries(spendingOverTime).map(([day, spending]) => ({ day: parseInt(day), spending }));

        // --- Calculate Advanced Metrics ---
        const topCategory = spendingByCategory[0]?.name || 'N/A';
        const highestSpendingDay = spendingOverTime.sort((a, b) => b.spending - a.spending)[0] || { day: 'N/A', spending: 0 };
        const averageDailySpend = summary.totalSpending > 0 ? summary.totalSpending / endDate.getDate() : 0;
        const burnRate = summary.totalIncome > 0 ? Math.round((summary.totalSpending / summary.totalIncome) * 100) : 0;
        const transactionCount = expenses.length;
        
        // Determine Financial Status and provide a tip
        let financialStatus = { text: 'On Track', color: '#10B981', tip: 'Great job staying within your income this month!' };
        if (burnRate > 85 && burnRate <= 100) {
            financialStatus = { text: 'Caution', color: '#F59E0B', tip: `You've used over 85% of your income. Review your spending in '${topCategory}' to stay on track.` };
        } else if (burnRate > 100) {
            financialStatus = { text: 'Overspent', color: '#EF4444', tip: `You've spent more than your income. It's a good time to create a budget for next month.` };
        }
        
        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

        // 3. Render the EJS template with the rich dataset
        const templatePath = path.join(__dirname, '..', 'views', 'report-template.ejs');
        const html = await ejs.renderFile(templatePath, {
            currentUser,
            summary,
            spendingByCategory,
            topCategory,
            highestSpendingDay,
            averageDailySpend,
            burnRate,
            transactionCount,
            financialStatus,
            monthName,
            year
        });

        // 4. Generate PDF
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        
        // 5. Send PDF to client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=TrackMoney-Report-${year}-${month}.pdf`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ error: "Failed to generate PDF report." });
    }
};