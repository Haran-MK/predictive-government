const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: String,
    required: true
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Citizen is required']
  },
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office',
    required: [true, 'Office is required']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  counter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counter',
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'completed', 'cancelled'],
    default: 'waiting'
  },

  // ----- Timing Fields (Critical for ML) -----
  arrivalTime: {
    type: Date,
    default: Date.now
  },
  serviceStartTime: {
    type: Date,
    default: null
  },
  serviceEndTime: {
    type: Date,
    default: null
  },

  // Calculated: serviceStartTime - arrivalTime (in minutes)
  actualWaitingTime: {
    type: Number,
    default: null
  },

  // Calculated: serviceEndTime - serviceStartTime (in minutes)
  serviceDuration: {
    type: Number,
    default: null
  },

  // ----- Queue Info -----
  queuePosition: {
    type: Number,
    default: 0
  },

  // ----- ML Prediction (filled by ML service in Phase 5) -----
  predictedWaitingTime: {
    type: Number,
    default: null
  },

  // Date of the appointment (for grouping tokens per day)
  date: {
    type: String, // format: YYYY-MM-DD
    default: () => new Date().toISOString().split('T')[0]
  }
}, {
  timestamps: true
});

// Index for efficient queries
tokenSchema.index({ office: 1, date: 1, status: 1 });
tokenSchema.index({ citizen: 1 });

module.exports = mongoose.model('Token', tokenSchema);
