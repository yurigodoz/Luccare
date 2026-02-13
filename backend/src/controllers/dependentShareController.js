const shareService = require('../services/dependentShareService');

/**
 * @swagger
 * /dependents/share:
 *   post:
 *     summary: Compartilha um dependente com outro usuário
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dependentId
 *               - email
 *               - role
 *             properties:
 *               dependentId:
 *                 type: integer
 *                 example: 1
 *               email:
 *                 type: string
 *                 example: "mae@email.com"
 *               role:
 *                 type: string
 *                 example: "FAMILY"
 *     responses:
 *       200:
 *         description: Dependente compartilhado com sucesso
 *       403:
 *         description: Usuário sem permissão
 */

async function share(req, res, next) {
    try {
        const {dependentId, email, role } = req.body;
        const result = await shareService.shareDependent(dependentId, req.userId, email, role);
        res.status(201).json(result);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

module.exports = { share };