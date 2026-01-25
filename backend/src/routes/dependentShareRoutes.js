const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const controller = require('../controllers/dependentShareController');

const router = express.Router();

router.use(authMiddleware);
router.post('/share', controller.share);

module.exports = router;