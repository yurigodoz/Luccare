const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const routineLogController = require('../controllers/routineLogController');

const router = express.Router();

router.put('/routines/logs/:logId', authMiddleware, routineLogController.updateNotes);
router.get('/routines/:routineId/logs', authMiddleware, routineLogController.listByRoutine);
router.patch('/schedules/:scheduleId/done', authMiddleware, routineLogController.markDone);

module.exports = router;