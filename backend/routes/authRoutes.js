const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  registerValidator,
  loginValidator,
  forgotValidator,
  resetValidator,
  otpValidator,
} = require('../validators/authValidator');

router.post('/register', registerValidator, validate, ctrl.register);
router.post('/login', loginValidator, validate, ctrl.login);
router.post('/verify-otp', otpValidator, validate, ctrl.verifyOtp);
router.post('/forgot-password', forgotValidator, validate, ctrl.forgotPassword);
router.post('/reset-password', resetValidator, validate, ctrl.resetPassword);

router.get('/me', protect, ctrl.getMe);
router.put('/profile', protect, ctrl.updateProfile);
router.put('/change-password', protect, ctrl.changePassword);

module.exports = router;