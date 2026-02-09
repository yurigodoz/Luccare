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
            req.userId,
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
 * /routines/logs/{logId}:
 *   put:
 *     summary: Atualiza observação de um log de rotina
 *     tags: [RoutineLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
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
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Tomou com dificuldade"
 *     responses:
 *       200:
 *         description: Observação atualizada com sucesso
 *       404:
 *         description: Log não encontrado
 */

async function updateNotes(req, res, next) {
    try {
        const { logId } = req.params;
        const { notes } = req.body;

        const updated = await routineLogService.updateLogNotes(
            Number(logId),
            req.userId,
            notes
        );

        res.json(updated);
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
            req.userId
        );

        res.json(logs);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /schedules/{scheduleId}/done:
 *   patch:
 *     summary: Marca um horário específico da rotina como concluído
 *     description: Cria ou atualiza o log de execução de um RoutineSchedule
 *     tags: [RoutineLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do schedule (evento do dia)
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Tomou após o café"
 *     responses:
 *       200:
 *         description: Log criado/atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 scheduleId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: DONE
 *                 notes:
 *                   type: string
 *                 doneAt:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Schedule não encontrado
 *       401:
 *         description: Não autenticado
 */

async function markDone(req, res, next) {
    try {
        const scheduleId = Number(req.params.scheduleId);
        const { notes } = req.body;

        const log = await routineLogService.markScheduleDone(
            scheduleId,
            req.userId,
            notes
        );

        res.json(log);

    } catch (err) {
        next(err);
    }
}

module.exports = {
    execute,
    updateNotes,
    listByRoutine,
    markDone
};
