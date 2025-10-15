const User = require("../models/user.model");

// GET the currently logged-in user's profile
exports.getMe = async (req, res) => {
    // The 'protect' middleware has already fetched the user and attached it to req.user
    res.status(200).json({ status: 'success', data: { user: req.user } });
};

// UPDATE the currently logged-in user's profile (name and picture)
exports.updateMe = async (req, res) => {
    try {
        // 1. Filter out unwanted field names that are not allowed to be updated
        const filteredBody = { name: req.body.name };

        // 2. If a file was uploaded, add the path to our update object
        if (req.file) {
            filteredBody.profilePicture = req.file.path;
        }

        // 3. Find the user by their ID (from protect middleware) and update them
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true, // Return the new, updated document
            runValidators: true,
        });

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- NEW: Controller function to update ONLY the Financial Profile ---
exports.updateFinancialProfile = async (req, res) => {
    try {
        const {
            userType,
            companyName,
            salaryDate,
            collegeName,
            monthlyIncome
        } = req.body;

        const profileUpdates = {
            'financialProfile.userType': userType,
            'financialProfile.companyName': companyName,
            'financialProfile.salaryDate': salaryDate,
            'financialProfile.collegeName': collegeName,
            'financialProfile.monthlyIncome': monthlyIncome,
        };

        Object.keys(profileUpdates).forEach(key => profileUpdates[key] === undefined && delete profileUpdates[key]);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileUpdates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};