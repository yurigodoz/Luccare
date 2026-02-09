require('dotenv').config();
const BusinessError = require('../errors/BusinessError');

async function login(email, password) {
    if (!email || !password) {
        throw new BusinessError('E-mail e senha são obrigatórios!');
    }

    try {
        const response = await fetch(`${process.env.AUTH_API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: email,
                password: password,
                app: process.env.AUTH_API_APP_SLUG
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new BusinessError(err.message || 'Credenciais inválidas');
        }

        const authResponse = await response.json();

        return authResponse;
    } catch (err) {
        console.log('Erro no login Auth Service:', err);
        throw new BusinessError('Erro ao fazer login no serviço de autenticação!');
    }
}
module.exports = { login };