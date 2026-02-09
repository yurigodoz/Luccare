require('dotenv').config();
const jwt = require('jsonwebtoken');

function authMiddlewareLocal(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não informado!' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Token mal formatado!' });
    }

    const [scheme, token] = parts;

    if (scheme !== 'Bearer') {
        return res.status(401).json({ message: 'Token mal formatado (scheme)!' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.app !== process.env.AUTH_API_APP_SLUG) {
            return res.status(401).json({ message: 'Token inválido para este app!' });
        }

        req.userId = decoded.userId;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado!' });
    }
}

async function authMiddlewareRemote(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não informado!' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Token mal formatado!' });
    }

    const [scheme] = parts;

    if (scheme !== 'Bearer') {
        return res.status(401).json({ message: 'Token mal formatado (scheme)!' });
    }

    try {
        const response = await fetch(`${process.env.AUTH_API_URL}/auth/validate-token`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'appSlug': process.env.AUTH_API_APP_SLUG
            }
        });

        if (!response.ok) {
            return res.status(401).json(await response.json());
        }

        const data = await response.json();

        if (data.app !== process.env.AUTH_API_APP_SLUG) {
            return res.status(401).json({ message: 'Token inválido para este app!' });
        }

        req.userId = data.userId;

        next();

    } catch (err) {
        console.log('Erro validando token no Auth Service:', err);
        return res.status(401).json({ message: 'Erro ao validar token!' });
    }
}

function authMiddleware(req, res, next) { // wrapper para escolher o modo de autenticação
    const mode = process.env.AUTH_MODE || 'LOCAL';

    if (mode === 'LOCAL') {
        return authMiddlewareLocal(req, res, next);
    }

    if (mode === 'REMOTE') {
        return authMiddlewareRemote(req, res, next);
    }

    return res.status(500).json({ message: 'AUTH_MODE inválido!' });
}

module.exports = authMiddleware;