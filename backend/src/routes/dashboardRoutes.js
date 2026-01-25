const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const controller = require('../controllers/dashboardController');

const router = express.Router();

router.use(authMiddleware);
router.get('/today', controller.today);

module.exports = router;
