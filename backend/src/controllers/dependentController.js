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

/**
 * @swagger
 * /dependents/{id}:
 *   get:
 *     summary: Obtém um dependente por ID
 *     tags: [Dependents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dependente encontrado
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Dependente não encontrado
 */

async function findById(req, res, next) {
    try {
        const dependent = await dependentService.getDependentById(Number(req.params.id), req.userId);
        res.json(dependent);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /dependents/{id}:
 *   put:
 *     summary: Atualiza um dependente
 *     tags: [Dependents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *       200:
 *         description: Dependente atualizado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para editar
 */

async function update(req, res, next) {
    try {
        const dependent = await dependentService.updateDependent(
            Number(req.params.id),
            req.body,
            req.userId
        );
        res.json(dependent);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /dependents/{id}:
 *   delete:
 *     summary: Exclui um dependente
 *     tags: [Dependents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Dependente excluído com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para excluir
 */

async function remove(req, res, next) {
    try {
        await dependentService.deleteDependent(Number(req.params.id), req.userId);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    create,
    list,
    findById,
    update,
    remove
};