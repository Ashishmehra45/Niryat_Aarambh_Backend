const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    default: "System Operator"
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: {
    type: String,
    enum: ['superadmin', 'manager'],
    default: 'superadmin' // Root access
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);