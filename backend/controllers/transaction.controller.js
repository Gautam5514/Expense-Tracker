const Transaction = require("../models/transaction.model");

exports.getTransactions = async (req, res) => {
  // req.user is now available from the 'protect' middleware
  const transactions = await Transaction.find({ user: req.user.id });
  res.status(200).json({ results: transactions.length, data: { transactions } });
};

exports.addTransaction = async (req, res) => {
  const newTransaction = await Transaction.create({
    ...req.body,
    user: req.user.id, // Associate transaction with the logged-in user
  });
  res.status(201).json({ data: { transaction: newTransaction } });
};

exports.updateTransaction = async (req, res) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, // Ensure user can only update their own transactions
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!transaction) {
    return res.status(404).json({ message: "No transaction found with that ID for this user" });
  }

  res.status(200).json({ data: { transaction } });
};

exports.deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });

  if (!transaction) {
    return res.status(404).json({ message: "No transaction found with that ID for this user" });
  }
  
  res.status(204).send();
};