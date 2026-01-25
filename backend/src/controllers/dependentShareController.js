const shareService = require('../services/dependentShareService');

async function share(req, res, next) {
    try {
        const {dependentId, email, role } = req.body;
        const result = shareService.shareDependent(dependentId, req.user.id, email, role);
        res.status(201).json(result);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

module.exports = { share };