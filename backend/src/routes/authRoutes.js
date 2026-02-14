const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.get('/validate-token', authMiddleware, authController.validateToken);
router.post('/refresh', authController.refreshToken);

module.exports = router;