const routineLogService = require('../services/routineLogService');

/**
 * @swagger
 * /schedules/{scheduleId}/log:
 *   put:
 *     summary: Cria ou atualiza o log de execução de um horário agendado
 *     description: Marca um horário como concluído (DONE) ou pulado (SKIPPED), com notas opcionais
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
 *                 enum: [DONE, SKIPPED]
 *                 example: DONE
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
 *                 scheduleId:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   example: DONE
 *                 notes:
 *                   type: string
 *                 dateTime:
 *                   type: string
 *                   format: date-time
 *                 doneBy:
 *                   type: integer
 *       400:
 *         description: Status inválido
 *       403:
 *         description: Usuário sem permissão
 *       404:
 *         description: Schedule não encontrado
 *       401:
 *         description: Não autenticado
 */
async function upsertLog(req, res, next) {
    try {
        const scheduleId = Number(req.params.scheduleId);
        const { status, notes } = req.body;

        const log = await routineLogService.upsertScheduleLog(
            scheduleId,
            req.userId,
            status,
            notes
        );

        res.json(log);
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

async function deleteLog(req, res, next) {
    try {
        const scheduleId = Number(req.params.scheduleId);

        await routineLogService.removeScheduleLog(scheduleId, req.userId);

        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    upsertLog,
    deleteLog,
    listByRoutine
};
