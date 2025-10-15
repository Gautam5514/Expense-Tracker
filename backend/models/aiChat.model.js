const mongoose = require("mongoose");

const aiChatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        query: {
            type: String,
            required: true,
        },
        reply: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("AIChat", aiChatSchema);
