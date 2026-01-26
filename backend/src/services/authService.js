require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const BusinessError = require('../errors/BusinessError');

async function login(email, password) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new BusinessError('Usuário não encontrado');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw new BusinessError('Senha inválida');
    }

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
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