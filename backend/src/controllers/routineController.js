const routineService = require('../services/routineService');

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