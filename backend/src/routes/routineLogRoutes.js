const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const routineLogController = require('../controllers/routineLogController');

const router = express.Router();

router.post('/routines/:routineId/logs', authMiddleware, routineLogController.execute);
router.get('/routines/:routineId/logs', authMiddleware, routineLogController.listByRoutine);


module.exports = router;