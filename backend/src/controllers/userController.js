const userService = require('../services/userService');

async function create(req, res) {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err); // Joga para o middleware central
    }
}

async function list(req, res) {
    const users = await userService.listUsers();
    res.json(users);
}

module.exports = {
    create,
    list
};