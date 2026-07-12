const { body } = require('express-validator');

exports.applyLeaveValidator = [
  body('type').isIn(['sick', 'casual', 'earned', 'maternity', 'unpaid', 'other']),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('reason').trim().notEmpty().isLength({ max: 500 }),
];