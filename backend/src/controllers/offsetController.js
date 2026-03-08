const offsetService = require('../services/offsetService');
const { getIo } = require('../socket');

async function getOffsets(req, res, next) {
    try {
        const offsets = await offsetService.getTodayOffsets(req.userId, req.timezone);
        res.json(offsets);
    } catch (err) {
        next(err);
    }
}

async function setOffset(req, res, next) {
    try {
        const { dependentId, type, offsetHours } = req.body;

        const result = await offsetService.setOffset(
            dependentId,
            type,
            offsetHours,
            req.userId,
            req.timezone
        );

        getIo().to(`dep-${result.dependentId}`).emit('offset-updated', result);

        res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getOffsets,
    setOffset
};
