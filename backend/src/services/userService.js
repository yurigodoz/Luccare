const userRepository = require('../repositories/userRepository');
const BusinessError = require('../errors/BusinessError');

async function createUser(data) {
    try {
        if (!data.name || !data.email || !data.password) {
            throw new BusinessError('Nome, e-mail e senha são obrigatórios!');
        }

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

        const authUser = await response.json();

        const user = await userRepository.create({
            id: authUser.id,
            name: data.name,
            email: authUser.email
        });

        return user;
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no createUser:', err);
        throw new BusinessError('Erro ao criar usuário.');
    }
}

async function listUsers() {
    try {
        return await userRepository.findAll();
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no listUsers:', err);
        throw new BusinessError('Erro ao listar usuários.');
    }
}

module.exports = {
    createUser,
    listUsers
};