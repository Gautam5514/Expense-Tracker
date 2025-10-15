const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.predictCategory = async (description) => {
    try {
        if (!description || description.trim() === "") return "Other";

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
    You are a financial assistant. 
    Categorize the following transaction into one of these categories:
    ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Education", "Health", "Other"].
    Transaction description: "${description}"
    Return only the category name.
    `;

        const result = await model.generateContent(prompt);
        const output = result.response.text().trim();
        console.log("AI Predicted Category:", output);
        return output || "Other";
    } catch (err) {
        console.error("AI Category Error:", err.message);
        return "Other";
    }
};

// ✅ NEW: A more powerful function for interactive suggestions
exports.getAISuggestions = async (description) => {
    try {
        if (!description || description.trim().length < 3) {
            return { category: null, tags: [] };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const availableCategories = [
            "Food & Dining",
            "Groceries",
            "Transport",
            "Shopping",
            "Entertainment",
            "Travel",
            "Bills & Utilities",
            "Health & Wellness",
            "Personal Care",
            "Education",
            "Gifts",
            "Other"
        ];

        // ✅ --- CHANGE 2: A vastly improved prompt with examples ---
        const prompt = `
            You are an expert financial assistant. Your task is to analyze a transaction description and suggest a relevant category and tags.

            Transaction Description: "${description}"

            Instructions:
            1.  Choose the single best category from this list: ${JSON.stringify(availableCategories)}.
            2.  Generate 3 to 5 relevant, concise tags. Tags can describe the item, the purpose (e.g., 'work', 'personal'), or people involved (e.g., 'friends', 'family').
            3.  Look at these examples to understand the desired output quality:
                - Input: "Weekly shopping at Walmart" -> Output: { "category": "Groceries", "tags": ["essentials", "food", "household"] }
                - Input: "Flight ticket to New York" -> Output: { "category": "Travel", "tags": ["flights", "vacation", "transport"] }
                - Input: "Movie tickets for Oppenheimer with friends" -> Output: { "category": "Entertainment", "tags": ["movies", "friends", "social"] }
                - Input: "Pizza and drinks for birthday party" -> Output: { "category": "Food & Dining", "tags": ["party", "pizza", "celebration", "friends"] }
            4.  Respond ONLY with a valid JSON object in the format below. Do not add any other text or markdown characters.
                {
                  "category": "ChosenCategory",
                  "tags": ["tag1", "tag2", "tag3"]
                }
        `;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text().trim();

        console.log("AI Raw Response:", textResponse);


        // ✅ --- CHANGE 3: More robust JSON parsing ---
        // This handles cases where the AI might accidentally include markdown ```json ... ```
        let jsonString = textResponse;
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonString = jsonMatch[0];
        }
        
        const suggestions = JSON.parse(jsonString);
        console.log("AI Suggestions:", suggestions);

        return suggestions;

    } catch (err) {
        console.error("AI Suggestion Error:", err.message);
        return { category: null, tags: [] };
    }
};