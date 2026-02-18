const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const routineLogController = require('../controllers/routineLogController');
const routineController = require('../controllers/routineController');

const router = express.Router();

router.put('/schedules/:scheduleId/log', authMiddleware, routineLogController.upsertLog);
router.delete('/schedules/:scheduleId/log', authMiddleware, routineLogController.deleteLog);
router.get('/routines/:routineId/logs', authMiddleware, routineLogController.listByRoutine);
router.get('/routines/:id', authMiddleware, routineController.getById);
router.put('/routines/:id', authMiddleware, routineController.update);
router.delete('/routines/:id', authMiddleware, routineController.remove);

module.exports = router;
