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
            throw new BusinessError(err.message || 'Credenciais inválidas', 401);
        }

        const authResponse = await response.json();

        return authResponse;
    } catch (err) {
        if (err instanceof BusinessError) throw err;
        console.log('Erro no login Auth Service:', err);
        throw new BusinessError('Erro ao fazer login no serviço de autenticação!');
    }
}

async function refreshToken(refreshToken) {
    try {
        if (!refreshToken) {
            throw new BusinessError('Token de atualização é obrigatório!');
        }
        
        const response = await fetch(`${process.env.AUTH_API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                refreshToken: refreshToken
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new BusinessError(err.message || 'Token de atualização inválido!', 401);
        }

        return await response.json();
    } catch (err) {
        if (err instanceof BusinessError) throw err;
        console.log('Erro no refreshToken Auth Service:', err);
        throw new BusinessError('Erro ao atualizar token no serviço de autenticação!');
    }
}

module.exports = { login, refreshToken };