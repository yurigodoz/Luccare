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

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Solicita a redefinição de senha (envia e-mail)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "meu@email.com"
 *     responses:
 *       200:
 *         description: Mensagem genérica de confirmação (sempre a mesma, independente de o e-mail existir)
 */

async function requestPasswordReset(req, res, next) {
    try {
        const { email } = req.body;
        const result = await authService.requestPasswordReset(email);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine a senha usando o token recebido por e-mail
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: "novaSenha123"
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */

async function resetPassword(req, res, next) {
    try {
        const { token, newPassword } = req.body;
        const result = await authService.resetPassword(token, newPassword);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Confirma a verificação de e-mail usando o token recebido por e-mail
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: E-mail verificado com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */

async function verifyEmail(req, res, next) {
    try {
        const { token } = req.body;
        const result = await authService.verifyEmail(token);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Reenvia o e-mail de verificação
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "meu@email.com"
 *     responses:
 *       200:
 *         description: Mensagem genérica de confirmação (sempre a mesma, independente de o e-mail existir ou já estar verificado)
 */

async function resendVerification(req, res, next) {
    try {
        const { email } = req.body;
        const result = await authService.resendVerification(email);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = { login, validateToken, refreshToken, requestPasswordReset, resetPassword, verifyEmail, resendVerification };