const Category = require("../models/category.model");

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ user: req.user.id });
  res.status(200).json({ results: categories.length, data: { categories } });
};

exports.addCategory = async (req, res) => {
  const newCategory = await Category.create({ ...req.body, user: req.user.id });
  res.status(201).json({ data: { category: newCategory } });
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).send();
};