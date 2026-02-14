const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const routineLogController = require('../controllers/routineLogController');

const router = express.Router();

router.put('/schedules/:scheduleId/log', authMiddleware, routineLogController.upsertLog);
router.get('/routines/:routineId/logs', authMiddleware, routineLogController.listByRoutine);

module.exports = router;
