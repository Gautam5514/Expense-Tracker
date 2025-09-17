// models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    address: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    profilePicture: { type: String, default: 'uploads/default.png' },

  
    financialProfile: {
      userType: { 
        type: String,
        enum: ['professional', 'student', 'unspecified'],
        default: 'unspecified'
      },
      companyName: { type: String, trim: true },
      salaryDate: { type: Number, min: 1, max: 31 }, 
      
      
      collegeName: { type: String, trim: true },

      // Common field for income
      monthlyIncome: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);