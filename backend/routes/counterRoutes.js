const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Counter = require('../models/Counter');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   POST /api/counters
// @desc    Create a new counter
// @access  Admin
router.post('/', [auth, adminAuth, [
  body('counterNumber', 'Counter number is required').isNumeric(),
  body('office', 'Office ID is required').notEmpty()
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const counter = new Counter(req.body);
    await counter.save();

    res.status(201).json(counter);
  } catch (error) {
    console.error('Create counter error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/counters/office/:officeId
// @desc    Get all counters for an office
// @access  Public
router.get('/office/:officeId', async (req, res) => {
  try {
    const counters = await Counter.find({ office: req.params.officeId })
      .populate('service', 'name')
      .populate('currentToken', 'tokenNumber status');
    res.json(counters);
  } catch (error) {
    console.error('Get counters error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/counters/:id/status
// @desc    Activate or deactivate a counter
// @access  Admin
router.put('/:id/status', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "active" or "inactive"' });
    }

    const counter = await Counter.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!counter) {
      return res.status(404).json({ message: 'Counter not found' });
    }

    res.json(counter);
  } catch (error) {
    console.error('Update counter status error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
