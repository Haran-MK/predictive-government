const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Token = require('../models/Token');
const Counter = require('../models/Counter');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { generateTokenNumber, getQueuePosition } = require('../utils/tokenGenerator');

// @route   POST /api/queue/book
// @desc    Book an appointment / generate digital token
// @access  Private (citizen)
router.post('/book', [auth, [
  body('office', 'Office ID is required').notEmpty(),
  body('service', 'Service ID is required').notEmpty()
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { office, service } = req.body;

    // Check if citizen already has an active token for this office today
    const today = new Date().toISOString().split('T')[0];
    const existingToken = await Token.findOne({
      citizen: req.user._id,
      office,
      date: today,
      status: { $in: ['waiting', 'serving'] }
    });

    if (existingToken) {
      return res.status(400).json({
        message: 'You already have an active token for this office today',
        token: existingToken
      });
    }

    // Generate token number
    const tokenNumber = await generateTokenNumber(office);

    // Calculate queue position
    const queuePosition = await Token.countDocuments({
      office,
      service,
      date: today,
      status: 'waiting'
    }) + 1;

    // Create token
    const token = new Token({
      tokenNumber,
      citizen: req.user._id,
      office,
      service,
      queuePosition,
      arrivalTime: new Date()
    });

    await token.save();

    // Populate references for response
    const populatedToken = await Token.findById(token._id)
      .populate('office', 'name city')
      .populate('service', 'name avgServiceDuration');

    res.status(201).json({
      message: 'Token generated successfully',
      token: populatedToken
    });
  } catch (error) {
    console.error('Book token error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/queue/my-tokens
// @desc    Get citizen's tokens (current & past)
// @access  Private
router.get('/my-tokens', auth, async (req, res) => {
  try {
    const tokens = await Token.find({ citizen: req.user._id })
      .populate('office', 'name city')
      .populate('service', 'name')
      .populate('counter', 'counterNumber')
      .sort({ createdAt: -1 });

    res.json(tokens);
  } catch (error) {
    console.error('Get my tokens error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/queue/office/:officeId/live
// @desc    Get live queue status for an office
// @access  Public
router.get('/office/:officeId/live', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const waitingTokens = await Token.find({
      office: req.params.officeId,
      date: today,
      status: 'waiting'
    })
      .populate('service', 'name')
      .populate('citizen', 'name')
      .sort({ arrivalTime: 1 });

    const servingTokens = await Token.find({
      office: req.params.officeId,
      date: today,
      status: 'serving'
    })
      .populate('service', 'name')
      .populate('citizen', 'name')
      .populate('counter', 'counterNumber');

    const completedCount = await Token.countDocuments({
      office: req.params.officeId,
      date: today,
      status: 'completed'
    });

    // Count active counters
    const activeCounters = await Counter.countDocuments({
      office: req.params.officeId,
      status: 'active'
    });

    res.json({
      waiting: waitingTokens,
      serving: servingTokens,
      waitingCount: waitingTokens.length,
      servingCount: servingTokens.length,
      completedCount,
      activeCounters
    });
  } catch (error) {
    console.error('Get live queue error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/queue/token/:id/start-service
// @desc    Start serving a token (admin assigns counter)
// @access  Admin
router.put('/token/:id/start-service', [auth, adminAuth], async (req, res) => {
  try {
    const { counterId } = req.body;

    const token = await Token.findById(req.params.id);
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (token.status !== 'waiting') {
      return res.status(400).json({ message: 'Token is not in waiting status' });
    }

    // Update token
    token.status = 'serving';
    token.serviceStartTime = new Date();
    token.counter = counterId || null;
    await token.save();

    // Update counter's current token
    if (counterId) {
      await Counter.findByIdAndUpdate(counterId, { currentToken: token._id });
    }

    const populatedToken = await Token.findById(token._id)
      .populate('office', 'name')
      .populate('service', 'name')
      .populate('counter', 'counterNumber')
      .populate('citizen', 'name');

    res.json({
      message: 'Service started',
      token: populatedToken
    });
  } catch (error) {
    console.error('Start service error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/queue/token/:id/complete
// @desc    Complete service for a token
// @access  Admin
router.put('/token/:id/complete', [auth, adminAuth], async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (token.status !== 'serving') {
      return res.status(400).json({ message: 'Token is not currently being served' });
    }

    // Record completion time
    token.serviceEndTime = new Date();
    token.status = 'completed';

    // Calculate actual waiting time (in minutes)
    // actualWaitingTime = serviceStartTime - arrivalTime
    token.actualWaitingTime = Math.round(
      (token.serviceStartTime - token.arrivalTime) / (1000 * 60)
    );

    // Calculate service duration (in minutes)
    // serviceDuration = serviceEndTime - serviceStartTime
    token.serviceDuration = Math.round(
      (token.serviceEndTime - token.serviceStartTime) / (1000 * 60)
    );

    await token.save();

    // Free up the counter
    if (token.counter) {
      await Counter.findByIdAndUpdate(token.counter, { currentToken: null });
    }

    res.json({
      message: 'Service completed',
      token,
      metrics: {
        actualWaitingTime: `${token.actualWaitingTime} minutes`,
        serviceDuration: `${token.serviceDuration} minutes`
      }
    });
  } catch (error) {
    console.error('Complete service error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/queue/token/:id/cancel
// @desc    Cancel a token
// @access  Private
router.put('/token/:id/cancel', auth, async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    if (token.status === 'completed' || token.status === 'cancelled') {
      return res.status(400).json({ message: 'Token cannot be cancelled' });
    }

    // Only the citizen who owns the token or an admin can cancel
    if (token.citizen.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this token' });
    }

    token.status = 'cancelled';
    await token.save();

    // Free up counter if it was being served
    if (token.counter) {
      await Counter.findByIdAndUpdate(token.counter, { currentToken: null });
    }

    res.json({ message: 'Token cancelled', token });
  } catch (error) {
    console.error('Cancel token error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/queue/position/:tokenId
// @desc    Get current queue position for a token
// @access  Private
router.get('/position/:tokenId', auth, async (req, res) => {
  try {
    const position = await getQueuePosition(req.params.tokenId);

    const token = await Token.findById(req.params.tokenId)
      .populate('service', 'name avgServiceDuration');

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    // Estimate waiting time based on position and avg service duration
    const estimatedWait = position * (token.service?.avgServiceDuration || 15);

    res.json({
      tokenNumber: token.tokenNumber,
      status: token.status,
      position,
      estimatedWaitMinutes: estimatedWait,
      predictedWaitingTime: token.predictedWaitingTime // From ML (null until Phase 5)
    });
  } catch (error) {
    console.error('Get position error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
