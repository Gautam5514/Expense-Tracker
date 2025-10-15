const { getAISuggestions } = require("../utils/aiCategorizer");
const Transaction = require("../models/transaction.model");
const AIChat = require("../models/aiChat.model");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.suggestTransactionDetails = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: "Description is required" });
        }

        const suggestions = await getAISuggestions(description);
        res.status(200).json(suggestions);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 🧠 Main Chat Controller
exports.chatWithAI = async (req, res) => {
    try {
        const { query } = req.body;
        const userId = new mongoose.Types.ObjectId(req.user._id);

        if (!query || query.trim() === "") {
            return res.status(400).json({ error: "Query text is required." });
        }

        // Fetch recent transactions for better context
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const transactions = await Transaction.find({
            user: userId,
            date: { $gte: startDate },
        })
            .select("type amount category merchant date")
            .lean();

        // Gemini prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an AI financial assistant for a personal expense tracker app.
      Use the following transaction data to answer user's question about their finances.
      Respond in a friendly, helpful tone under 5 sentences.
      
      Example:
      - "You spent ₹12,000 on Food last month, mostly with Swiggy."
      - "Your top 3 categories this month are Shopping, Food, and Transport."
      
      Here is user's data (latest 200 entries):
      ${JSON.stringify(transactions.slice(-200))}

      Question: "${query}"
    `;

        const result = await model.generateContent(prompt);
        const reply = result.response.text().trim();

        // Save chat to DB
        await AIChat.create({
            user: userId,
            query,
            reply,
        });

        res.status(200).json({ reply });
    } catch (err) {
        console.error("AI Chat Error:", err.message);
        res.status(500).json({ error: "AI assistant failed to respond." });
    }
};

// 🕓 Get Chat History
exports.getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const history = await AIChat.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch chat history." });
    }
};