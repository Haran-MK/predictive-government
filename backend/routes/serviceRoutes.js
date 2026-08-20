const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// @route   POST /api/services
// @desc    Create a new service for an office
// @access  Admin
router.post('/', [auth, adminAuth, [
  body('name', 'Service name is required').notEmpty(),
  body('office', 'Office ID is required').notEmpty()
]], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = new Service(req.body);
    await service.save();

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/services/office/:officeId
// @desc    Get all services for an office
// @access  Public
router.get('/office/:officeId', async (req, res) => {
  try {
    const services = await Service.find({
      office: req.params.officeId,
      isActive: true
    });
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('office', 'name city');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error('Get service error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
