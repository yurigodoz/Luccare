const routineService = require('../services/routineService');

/**
 * @swagger
 * /dependents/{dependentId}/routines:
 *   post:
 *     summary: Cria uma nova rotina para um dependente
 *     tags: [Routines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dependentId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - times
 *               - daysOfWeek
 *             properties:
 *               type:
 *                 type: string
 *                 example: MEDICATION
 *               title:
 *                 type: string
 *                 example: Domperidona 1mg/ml - 3ml
 *               description:
 *                 type: string
 *                 example: 5ml
 *               times:
 *                 type: array
 *                 example: ["07:00", "13:00", "18:00"]
 *                 items:
 *                   type: string
 *               daysOfWeek:
 *                 type: array
 *                 example: [0, 1, 2, 3, 4, 5, 6]
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Rotina criada com sucesso
 *       403:
 *         description: Usuário sem permissão para este dependente
 */

async function create(req, res, next) {
    try {
        const { dependentId } = req.params;
        const routine = await routineService.createRoutine(
            req.body,
            Number(dependentId),
            req.user.id
        );
        res.status(201).json(routine);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /dependents/{dependentId}/routines:
 *   get:
 *     summary: Lista as rotinas de um dependente
 *     tags: [Routines]
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
 *         description: Lista de rotinas
 *       403:
 *         description: Usuário sem permissão para este dependente
 */

async function list(req, res, next) {
    try {
        const { dependentId } = req.params;
        const routines = await routineService.listRoutines(
            Number(dependentId),
            req.user.id
        );
        res.json(routines);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    create,
    list
};