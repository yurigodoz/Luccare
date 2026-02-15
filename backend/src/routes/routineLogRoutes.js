const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const routineLogController = require('../controllers/routineLogController');
const routineController = require('../controllers/routineController');

const router = express.Router();

router.put('/schedules/:scheduleId/log', authMiddleware, routineLogController.upsertLog);
router.get('/routines/:routineId/logs', authMiddleware, routineLogController.listByRoutine);
router.delete('/routines/:id', authMiddleware, routineController.remove);

module.exports = router;
