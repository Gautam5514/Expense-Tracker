const Transaction = require("../models/transaction.model");
const Category = require("../models/category.model");

// GET all categories WITH calculated spending data (IMPROVED HYBRID LOGIC)
exports.getCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // STEP 1: Get the master list of all defined category names for the user.
    const allCategoryDocs = await Category.find({ user: userId }).lean();
    // .lean() makes it a plain JS object for performance.
    
    // STEP 2: Get the spending data by aggregating transactions (same as before).
    const spendingData = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
    ]);

    // STEP 3: Create a map of the spending data for easy lookup.
    // e.g., { "Groceries": 5000, "Travel": 2000 }
    const spendingMap = spendingData.reduce((map, item) => {
      map[item._id] = item.total;
      return map;
    }, {});
    
    // STEP 4: Merge the master list with the spending data.
    let mergedCategories = allCategoryDocs.map(catDoc => ({
      name: catDoc.name,
      // Use the spending from the map, OR default to 0 if no spending exists.
      total: spendingMap[catDoc.name] || 0,
    }));
    
    // Calculate the grand total for percentages based on the merged data.
    const grandTotal = mergedCategories.reduce((sum, cat) => sum + cat.total, 0);

    // Add percentages to the final result.
    mergedCategories = mergedCategories.map(cat => ({
      ...cat,
      percent: grandTotal > 0 ? Math.round((cat.total / grandTotal) * 100) : 0
    })).sort((a, b) => b.total - a.total); // Sort by highest spending

    res.status(200).json({ data: { categories: mergedCategories } });

  } catch (error) {
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