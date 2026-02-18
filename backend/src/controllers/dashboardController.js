const dashboardService = require('../services/dashboardService');

/**
 * @swagger
 * /dashboard/today:
 *   get:
 *     summary: Retorna o resumo das rotinas do dia para o usuário autenticado
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Visão geral das rotinas do dia (pendentes, concluídas, horários)
 *       401:
 *         description: Não autorizado
 */

async function today(req, res, next) {
    try {
        const data = await dashboardService.getTodayOverview(req.userId, req.timezone);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

module.exports = { today };