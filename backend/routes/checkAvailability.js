const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/check/employee-id/:id
router.get('/employee-id/:id', async (req, res) => {
  try {
    const employeeId = req.params.id.toUpperCase();
    
    // Validate format
    const regex = /^EMP\d{3,}$/;
    if (!regex.test(employeeId)) {
      return res.json({ 
        available: false, 
        valid: false,
        message: 'Format must be EMP followed by 3+ digits (e.g., EMP001)' 
      });
    }
    
    const existing = await User.findOne({ employeeId });
    
    if (existing) {
      return res.json({ 
        available: false, 
        valid: true,
        message: 'This Employee ID is already taken' 
      });
    }
    
    res.json({ 
      available: true, 
      valid: true,
      message: 'Employee ID is available' 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/check/email/:email
router.get('/email/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ 
        available: false, 
        valid: false,
        message: 'Please enter a valid email' 
      });
    }
    
    const existing = await User.findOne({ email });
    
    if (existing) {
      return res.json({ 
        available: false, 
        valid: true,
        message: 'This email is already registered' 
      });
    }
    
    res.json({ 
      available: true, 
      valid: true,
      message: 'Email is available' 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/check/constants - Get IT departments and designations
router.get('/constants', (req, res) => {
  const { IT_DEPARTMENTS, IT_DESIGNATIONS } = require('../validators/authValidator');
  res.json({
    departments: IT_DEPARTMENTS,
    designations: IT_DESIGNATIONS,
  });
});

module.exports = router;