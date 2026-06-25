// models/Requirement.js
const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema({
  buyerName: { 
    type: String, 
    required: true 
  },
  buyerPhone: { 
    type: String, 
    required: true 
  },
  productName: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, // Storing as a number is better for math/sorting later
    required: true 
  },
  unit: { 
    type: String, 
    default: 'Kg' 
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Requirement', requirementSchema);