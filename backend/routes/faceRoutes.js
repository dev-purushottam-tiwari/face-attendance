const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faceController');
const { protect } = require('../middlewares/auth');

router.post('/register', protect, ctrl.registerFace);
router.get('/status', protect, ctrl.getFaceStatus);

module.exports = router;