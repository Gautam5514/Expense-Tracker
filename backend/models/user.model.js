const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    address: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
      profilePicture: { type: String, default: 'uploads/default.png' },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
