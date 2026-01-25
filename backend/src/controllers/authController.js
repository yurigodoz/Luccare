const authService = require('../services/authService');

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

module.exports = { login };