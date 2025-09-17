const Transaction = require("../models/transaction.model");
const Category = require("../models/category.model");

exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Date filtering logic
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // STEP 1: Get the master list of all categories from the Category collection.
    // This is crucial because it gives us the _id for each category.
    const allCategoryDocs = await Category.find({ user: userId }).lean();
    
    // STEP 2: Get the spending data for only the selected month from Transactions.
    const spendingData = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]);

    // STEP 3: Create a map for easy lookup of spending.
    const spendingMap = spendingData.reduce((map, item) => {
      map[item._id] = item.total;
      return map;
    }, {});
    
    // STEP 4: Merge the master list with the monthly spending data.
    // This ensures we show all categories, even those with 0 spending.
    let mergedCategories = allCategoryDocs.map(catDoc => ({
      _id: catDoc._id, // IMPORTANT: Now we have the ID for Edit/Delete
      name: catDoc.name,
      total: spendingMap[catDoc.name] || 0,
    }));
    
    const grandTotal = mergedCategories.reduce((sum, cat) => sum + cat.total, 0);

    mergedCategories = mergedCategories.map(cat => ({
      ...cat,
      percent: grandTotal > 0 ? Math.round((cat.total / grandTotal) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    res.status(200).json({ data: { categories: mergedCategories } });

  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: error.message });
  }
};

// ADD and DELETE functions remain the same and are correct.
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }
    const existingCategory = await Category.findOne({ user: req.user.id, name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
        return res.status(400).json({ message: "This category already exists." });
    }
    const newCategory = await Category.create({ name, user: req.user.id });
    res.status(201).json({ data: { category: newCategory } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!category) {
        return res.status(404).json({ message: "Category not found." });
    }
    res.status(204).send();
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCategoryName = async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        const userId = req.user.id;

        if (!oldName || !newName || oldName === newName) {
            return res.status(400).json({ message: "Old name and new name are required and must be different." });
        }

        // 1. Update the category in the master Category collection
        const updatedCategory = await Category.findOneAndUpdate(
            { user: userId, name: oldName },
            { $set: { name: newName } },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: `Category '${oldName}' not found.` });
        }

        // 2. Update all transactions that use the old category name
        await Transaction.updateMany(
            { user: userId, category: oldName },
            { $set: { category: newName } }
        );

        res.status(200).json({ 
            message: `Category '${oldName}' was renamed to '${newName}' and all associated transactions have been updated.`
        });

    } catch (error) {
        // Handle potential duplicate key error if newName already exists
        if (error.code === 11000) {
            return res.status(400).json({ message: `A category named '${newName}' already exists.` });
        }
        console.error("Error updating category name:", error);
        res.status(500).json({ error: "An internal server error occurred." });
    }
};