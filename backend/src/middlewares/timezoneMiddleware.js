const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

function timezoneMiddleware(req, res, next) {
    req.timezone = req.headers['x-timezone'] || DEFAULT_TIMEZONE;
    next();
}

module.exports = timezoneMiddleware;
