const express = require('express');
const router = express.Router();
const offsetController = require('../controllers/offsetController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/offsets', offsetController.getOffsets);
router.put('/offsets', offsetController.setOffset);

module.exports = router;
