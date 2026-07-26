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
 *               isTemporary:
 *                 type: boolean
 *                 description: Se true, exige startDate e durationDays; endDate é calculado pelo servidor.
 *                 example: false
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Obrigatório quando isTemporary=true. Formato YYYY-MM-DD.
 *                 example: "2026-07-25"
 *               durationDays:
 *                 type: integer
 *                 description: Obrigatório quando isTemporary=true. Entre 1 e 365.
 *                 example: 5
 *     responses:
 *       201:
 *         description: Rotina criada com sucesso. Quando isTemporary=true, a resposta inclui endDate (calculado) e durationDays.
 *       403:
 *         description: Usuário sem permissão para este dependente
 */

async function create(req, res, next) {
    try {
        const { dependentId } = req.params;
        const routine = await routineService.createRoutine(
            req.body,
            Number(dependentId),
            req.userId,
            req.timezone
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
 *         description: Lista de rotinas. Rotinas temporárias expiradas são omitidas; rotinas temporárias dentro da janela incluem durationDays e daysRemaining.
 *       403:
 *         description: Usuário sem permissão para este dependente
 */

async function list(req, res, next) {
    try {
        const { dependentId } = req.params;
        const routines = await routineService.listRoutines(
            Number(dependentId),
            req.userId,
            req.timezone
        );
        res.json(routines);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /routines/{id}:
 *   get:
 *     summary: Retorna uma rotina pelo ID
 *     tags: [Routines]
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
 *         description: Rotina encontrada
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 */

async function getById(req, res, next) {
    try {
        const routine = await routineService.getRoutine(Number(req.params.id), req.userId);
        res.json(routine);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /routines/{id}:
 *   put:
 *     summary: Atualiza uma rotina
 *     tags: [Routines]
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
 *               isTemporary:
 *                 type: boolean
 *                 description: true converte/mantém a rotina como temporária (exige startDate e durationDays); false converte/mantém como permanente (limpa startDate/endDate).
 *                 example: false
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Obrigatório quando isTemporary=true. Formato YYYY-MM-DD.
 *                 example: "2026-07-25"
 *               durationDays:
 *                 type: integer
 *                 description: Obrigatório quando isTemporary=true. Entre 1 e 365.
 *                 example: 5
 *     responses:
 *       200:
 *         description: Rotina atualizada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para editar
 */

async function update(req, res, next) {
    try {
        const routine = await routineService.updateRoutine(
            Number(req.params.id),
            req.body,
            req.userId,
            req.timezone
        );
        res.json(routine);
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /routines/{id}:
 *   delete:
 *     summary: Exclui uma rotina
 *     tags: [Routines]
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
 *         description: Rotina excluída com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão para excluir
 */

async function remove(req, res, next) {
    try {
        await routineService.deleteRoutine(Number(req.params.id), req.userId);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    create,
    list,
    getById,
    update,
    remove
};