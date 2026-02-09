const dependentService = require('../services/dependentService');

/**
 * @swagger
 * /dependents:
 *   post:
 *     summary: Cadastra um novo dependente
 *     tags: [Dependents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Lucca"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "2021-02-13"
 *               notes:
 *                 type: string
 *                 example: "NBIA5"
 *     responses:
 *       201:
 *         description: Dependente criado com sucesso
 *       401:
 *         description: Não autorizado
 */

async function create(req, res, next) {
    try {
        const dependent = await dependentService.createDependent(req.body, req.userId);
        res.status(201).json(dependent);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

/**
 * @swagger
 * /dependents:
 *   get:
 *     summary: Lista os dependentes do usuário autenticado
 *     tags: [Dependents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dependentes
 *       401:
 *         description: Não autorizado
 */

async function list(req, res, next) {
    try {
        const dependents = await dependentService.listDependentsByUser(req.userId);
        res.json(dependents);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

module.exports = {
    create,
    list
};