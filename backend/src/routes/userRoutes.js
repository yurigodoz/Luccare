const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', userController.create); // cadastro aberto
router.get('/', authMiddleware, userController.list); // listar apenas para usuários autenticados

module.exports = router;