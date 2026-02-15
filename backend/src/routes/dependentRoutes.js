const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const dependentController = require('../controllers/dependentController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', dependentController.create);
router.get('/', dependentController.list);
router.get('/:id', dependentController.findById);
router.delete('/:id', dependentController.remove);

module.exports = router;