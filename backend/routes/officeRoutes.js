const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Office = require('../models/Office');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   POST /api/offices
// @desc    Create a new office
// @access  Admin
router.post('/', [auth, adminAuth, [
  body('name', 'Office name is required').notEmpty(),
  body('address', 'Address is required').notEmpty(),
  body('city', 'City is required').notEmpty()
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const office = new Office(req.body);
    await office.save();

    res.status(201).json(office);
  } catch (error) {
    console.error('Create office error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/offices
// @desc    Get all offices
// @access  Public
router.get('/', async (req, res) => {
  try {
    const offices = await Office.find({ isActive: true });
    res.json(offices);
  } catch (error) {
    console.error('Get offices error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/offices/:id
// @desc    Get office by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }
    res.json(office);
  } catch (error) {
    console.error('Get office error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/offices/:id
// @desc    Update office
// @access  Admin
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const office = await Office.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!office) {
      return res.status(404).json({ message: 'Office not found' });
    }

    res.json(office);
  } catch (error) {
    console.error('Update office error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
