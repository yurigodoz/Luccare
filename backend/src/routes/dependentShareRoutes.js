const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const controller = require('../controllers/dependentShareController');

const router = express.Router();

router.use(authMiddleware);
router.post('/share', controller.share);
router.get('/:dependentId/users', controller.listUsers);
router.delete('/:dependentId/users/:userId', controller.revokeAccess);

module.exports = router;