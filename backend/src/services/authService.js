const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = 'chave-super-secreta'; // depois mover para env

async function login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new Error('Senha inválida');
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
}

module.exports = { login };