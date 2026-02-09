const userRepository = require('../repositories/userRepository');
const BusinessError = require('../errors/BusinessError');

async function createUser(data) {
    if (!data.name || !data.email || !data.password) {
        throw new BusinessError('Nome, e-mail e senha são obrigatórios!');
    }

    let authUser;

    try {
        const response = await fetch(`${process.env.AUTH_API_URL}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                app: process.env.AUTH_API_APP_SLUG
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new BusinessError(JSON.stringify(err));
        }

        authUser = await response.json();

    } catch (err) {
        console.log('Erro ao chamar Auth Service:', err);
        throw new BusinessError('Erro ao registrar usuário no serviço de autenticação!');
    }

    let user = {};

    try {
        user = await userRepository.create({
            id: authUser.id,
            name: data.name,
            email: authUser.email
    });
    } catch (err) {
        console.log('Erro ao criar usuário no Luccare:', err);
        throw new BusinessError('Erro ao criar usuário!');
    }

    return user;
}

async function listUsers() {
    return await userRepository.findAll();
}

module.exports = {
    createUser,
    listUsers
};