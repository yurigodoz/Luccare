const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const routineController = require('../controllers/routineController');

const router = express.Router();

router.use(authMiddleware);

router.post('/:dependentId/routines', routineController.create);
router.get('/:dependentId/routines', routineController.list);

module.exports = router;
