const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  counterNumber: {
    type: Number,
    required: [true, 'Counter number is required']
  },
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office',
    required: [true, 'Office is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  currentToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Token',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Counter', counterSchema);
