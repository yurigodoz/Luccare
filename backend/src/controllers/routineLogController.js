const routineLogService = require('../services/routineLogService');

/**
 * @swagger
 * /routines/{routineId}/logs:
 *   post:
 *     summary: Registra a execução de uma rotina
 *     tags: [RoutineLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routineId
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: "DONE"
 *               notes:
 *                 type: string
 *                 example: "Tomou o remédio sem dificuldade"
 *     responses:
 *       201:
 *         description: Execução registrada com sucesso
 *       403:
 *         description: Usuário sem permissão
 */

async function execute(req, res, next) {
    try {
        const { routineId } = req.params;
        const { status, notes } = req.body;

        const log = await routineLogService.registerExecution(
            Number(routineId),
            req.user.id,
            status,
            notes
        );

        res.status(201).json(log);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /routines/{routineId}/logs:
 *   get:
 *     summary: Lista o histórico de execuções de uma rotina
 *     tags: [RoutineLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routineId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico da rotina
 *       403:
 *         description: Usuário sem permissão
 */

async function listByRoutine(req, res, next) {
    try {
        const { routineId } = req.params;

        const logs = await routineLogService.listByRoutine(
            Number(routineId),
            req.user.id
        );

        res.json(logs);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    execute,
    listByRoutine
};
