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

/**
 * @swagger
 * /dependents/{dependentId}/users:
 *   get:
 *     summary: Lista usuários com acesso a um dependente
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dependentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de usuários com acesso
 *       403:
 *         description: Sem permissão
 */

async function listUsers(req, res, next) {
    try {
        const users = await shareService.listUsers(
            Number(req.params.dependentId),
            req.userId
        );
        res.json(users);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /dependents/{dependentId}/users/{userId}:
 *   delete:
 *     summary: Revoga o acesso de um usuário a um dependente
 *     tags: [Sharing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dependentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Acesso revogado com sucesso
 *       403:
 *         description: Sem permissão
 */

async function revokeAccess(req, res, next) {
    try {
        await shareService.revokeAccess(
            Number(req.params.dependentId),
            Number(req.params.userId),
            req.userId
        );
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

module.exports = { share, listUsers, revokeAccess };