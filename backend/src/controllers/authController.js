const authService = require('../services/authService');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "meu@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

async function validateToken(req, res) {
    return res.json(req.user);
}

module.exports = { login, validateToken };