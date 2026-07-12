const { body, query } = require('express-validator');

exports.checkInValidator = [
  body('descriptor')
    .isArray({ min: 128, max: 128 })
    .withMessage('Face descriptor must be 128 numbers'),
];

exports.checkOutValidator = [
  body('descriptor')
    .isArray({ min: 128, max: 128 })
    .withMessage('Face descriptor must be 128 numbers'),
];

exports.reportQueryValidator = [
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('department').optional().trim(),
  query('status').optional().isIn(['present', 'absent', 'late', 'half-day', 'on-leave']),
];