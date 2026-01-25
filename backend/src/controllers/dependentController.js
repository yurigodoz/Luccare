const dependentService = require('../services/dependentService');

async function create(req, res, next) {
    try {
        const dependent = await dependentService.createDependent(req.body, req.user.id);
        res.status(201).json(dependent);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

async function list(req, res, next) {
    try {
        const dependents = await dependentService.listDependentsByUser(req.user.id);
        res.json(dependents);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

module.exports = {
    create,
    list
};