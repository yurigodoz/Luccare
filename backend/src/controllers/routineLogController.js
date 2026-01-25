const routineLogService = require('../services/routineLogService');

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
