const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/training-data
// @desc    Export completed tokens as training data for ML model
// @access  Admin
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { limit, offset } = req.query;

    const query = Token.find({ status: 'completed', actualWaitingTime: { $ne: null } })
      .populate('office', 'name city totalCounters')
      .populate('service', 'name avgServiceDuration')
      .sort({ createdAt: -1 });

    if (offset) query.skip(parseInt(offset));
    if (limit) query.limit(parseInt(limit));

    const records = await query;

    // Transform to ML-friendly format
    const trainingData = records.map(record => ({
      // Features for ML model
      queueLength: record.queuePosition,
      activeCounters: record.office?.totalCounters || 0,
      serviceType: record.service?.name || 'Unknown',
      avgServiceDuration: record.service?.avgServiceDuration || 15,
      arrivalHour: new Date(record.arrivalTime).getHours(),
      arrivalMinute: new Date(record.arrivalTime).getMinutes(),
      dayOfWeek: new Date(record.arrivalTime).getDay(),

      // Target variable
      actualWaitingTime: record.actualWaitingTime,

      // Additional info
      serviceDuration: record.serviceDuration,
      date: record.date,
      officeId: record.office?._id,
      officeName: record.office?.name
    }));

    res.json({
      count: trainingData.length,
      data: trainingData
    });
  } catch (error) {
    console.error('Get training data error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/training-data/stats
// @desc    Get queue statistics summary
// @access  Admin
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    const totalCompleted = await Token.countDocuments({ status: 'completed' });
    const totalCancelled = await Token.countDocuments({ status: 'cancelled' });
    const totalWaiting = await Token.countDocuments({ status: 'waiting' });
    const totalServing = await Token.countDocuments({ status: 'serving' });

    // Aggregate stats for completed tokens
    const stats = await Token.aggregate([
      { $match: { status: 'completed', actualWaitingTime: { $ne: null } } },
      {
        $group: {
          _id: null,
          avgWaitingTime: { $avg: '$actualWaitingTime' },
          maxWaitingTime: { $max: '$actualWaitingTime' },
          minWaitingTime: { $min: '$actualWaitingTime' },
          avgServiceDuration: { $avg: '$serviceDuration' },
          totalRecords: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: {
        totalCompleted,
        totalCancelled,
        totalWaiting,
        totalServing
      },
      trainingDataStats: stats[0] || {
        avgWaitingTime: 0,
        maxWaitingTime: 0,
        minWaitingTime: 0,
        avgServiceDuration: 0,
        totalRecords: 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
