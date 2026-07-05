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
            throw new BusinessError(err.error || 'Credenciais inválidas', response.status, err.code);
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
            throw new BusinessError(err.error || 'Token de atualização inválido!', 401);
        }

        return await response.json();
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no refreshToken Auth Service:', err);
        throw new BusinessError('Erro ao atualizar token no serviço de autenticação!');
    }
}

async function requestPasswordReset(email) {
    if (!email) {
        throw new BusinessError('E-mail é obrigatório!');
    }

    try {
        const response = await fetch(`${process.env.AUTH_API_URL}/auth/request-password-reset`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: email,
                app: process.env.AUTH_API_APP_SLUG
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new BusinessError(err.error || 'Erro ao solicitar redefinição de senha', 400);
        }

        return await response.json();
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no requestPasswordReset Auth Service:', err);
        throw new BusinessError('Erro ao fazer solicitação de redefinição de senha no serviço de autenticação!');
    }
}

async function resetPassword(token, newPassword) {
    if (!token || !newPassword) {
        throw new BusinessError('Token e nova senha são obrigatórios!');
    }

    try {
        const response = await fetch(`${process.env.AUTH_API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                token: token,
                newPassword: newPassword
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new BusinessError(err.error || 'Token inválido ou expirado', 400);
        }

        return await response.json();
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no resetPassword Auth Service:', err);
        throw new BusinessError('Erro ao redefinir senha no serviço de autenticação!');
    }
}

async function verifyEmail(token) {
    if (!token) {
        throw new BusinessError('Token é obrigatório!');
    }

    try {
        const response = await fetch(`${process.env.AUTH_API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                token: token
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new BusinessError(err.error || 'Token inválido ou expirado', 400);
        }

        return await response.json();
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no verifyEmail Auth Service:', err);
        throw new BusinessError('Erro ao verificar e-mail no serviço de autenticação!');
    }
}

async function resendVerification(email) {
    if (!email) {
        throw new BusinessError('E-mail é obrigatório!');
    }

    try {
        const response = await fetch(`${process.env.AUTH_API_URL}/auth/resend-verification`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: email,
                app: process.env.AUTH_API_APP_SLUG
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new BusinessError(err.error || 'Erro ao reenviar e-mail de verificação', 400);
        }

        return await response.json();
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no resendVerification Auth Service:', err);
        throw new BusinessError('Erro ao reenviar e-mail de verificação no serviço de autenticação!');
    }
}

module.exports = { login, refreshToken, requestPasswordReset, resetPassword, verifyEmail, resendVerification };