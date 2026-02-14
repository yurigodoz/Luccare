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


/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Atualiza o token JWT de um usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "040b3d74f38ca46c9c6af15c78de2f106eba123c5c8eb5c09a6ef4c977ff565493edeb6310a62aa7"
 *     responses:
 *       200:
 *         description: Token atualizado com sucesso
 *       401:
 *         description: Token inválido
 */

async function refreshToken(req, res, next) {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshToken(refreshToken);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = { login, validateToken, refreshToken };