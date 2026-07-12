const { body } = require('express-validator');
const User = require('../models/User');

// IT Industry Departments
const IT_DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'QA/Testing',
  'DevOps',
  'Data Science',
  'IT Support',
  'Security',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Administration',
  'Research & Development',
];

// IT Industry Designations
const IT_DESIGNATIONS = [
  'Intern',
  'Trainee',
  'Junior Software Engineer',
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Software Engineer',
  'Principal Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Cloud Engineer',
  'QA Engineer',
  'Test Lead',
  'UI/UX Designer',
  'Graphic Designer',
  'Product Designer',
  'Data Scientist',
  'Data Analyst',
  'Data Engineer',
  'Machine Learning Engineer',
  'System Administrator',
  'Network Engineer',
  'Security Engineer',
  'Product Manager',
  'Project Manager',
  'Program Manager',
  'Technical Lead',
  'Engineering Manager',
  'Director of Engineering',
  'VP of Engineering',
  'CTO',
  'CEO',
  'HR Manager',
  'Recruiter',
  'Finance Manager',
  'Marketing Manager',
  'Other',
];

// Employee ID regex: EMP followed by positive number (e.g., EMP001, EMP123)
const EMPLOYEE_ID_REGEX = /^EMP\d{3,}$/i;

// Strong password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Name regex: only letters and spaces
const NAME_REGEX = /^[A-Za-z\s.'-]+$/;

exports.registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
    .matches(NAME_REGEX).withMessage('Name can only contain letters, spaces, dots, hyphens'),
    
  body('employeeId')
    .trim()
    .notEmpty().withMessage('Employee ID is required')
    .toUpperCase()
    .custom(async (value) => {
      // Check format: EMP + 3+ digits
      if (!EMPLOYEE_ID_REGEX.test(value)) {
        throw new Error('Employee ID must start with "EMP" followed by at least 3 digits (e.g., EMP001)');
      }
      // Check uniqueness
      const existing = await User.findOne({ employeeId: value.toUpperCase() });
      if (existing) {
        throw new Error('This Employee ID is already taken');
      }
      return true;
    }),
    
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .custom(async (value) => {
      const existing = await User.findOne({ email: value.toLowerCase() });
      if (existing) {
        throw new Error('This email is already registered');
      }
      return true;
    }),
    
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(STRONG_PASSWORD_REGEX).withMessage(
      'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)'
    ),
    
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required')
    .isIn(IT_DEPARTMENTS).withMessage('Please select a valid department'),
    
  body('designation')
    .trim()
    .notEmpty().withMessage('Designation is required')
    .isIn(IT_DESIGNATIONS).withMessage('Please select a valid designation'),
];

exports.loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

exports.forgotValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

exports.resetValidator = [
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters')
    .matches(STRONG_PASSWORD_REGEX).withMessage(
      'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character'
    ),
];

exports.otpValidator = [
  body('otp')
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
];

// Export constants for frontend use
exports.IT_DEPARTMENTS = IT_DEPARTMENTS;
exports.IT_DESIGNATIONS = IT_DESIGNATIONS;