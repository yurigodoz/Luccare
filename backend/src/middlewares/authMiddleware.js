const jwt = require('jsonwebtoken');

const JWT_SECRET = 'chave-super-secreta'; // depois mover para env

function authMiddleware(req, res, next) {
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
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado!' });
    }
}

module.exports = authMiddleware;