const dashboardService = require('../services/dashboardService');

async function today(req, res, next) {
    try {
        const data = await dashboardService.getTodayOverview(req.user.id);
        res.json(data);
    } catch (err) {
        next(err);
    }
}

module.exports = { today };