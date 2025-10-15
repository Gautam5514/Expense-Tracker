const express = require('express');
const router = express.Router();
const { suggestTransactionDetails } = require('../controllers/ai.controller.js');
const { protect } = require("../controllers/auth.controller");
const { chatWithAI, getChatHistory } = require("../controllers/ai.controller");

// @route   POST /api/ai/suggest-details
// @desc    Get AI-powered category and tag suggestions for a transaction
// @access  Private
router.post('/suggest-details', protect, suggestTransactionDetails);

// POST for new message
router.post("/chat", protect, chatWithAI);

// GET for chat history
router.get("/history", protect, getChatHistory);

module.exports = router;