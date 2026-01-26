const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');
const BusinessError = require('../errors/BusinessError');

async function createUser(data) {
    if (!data.name || !data.email || !data.password) {
        throw new BusinessError('Nome, e-mail e senha são obrigatórios!');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
        
    return userRepository.create({
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role || 'PARENT'
    });
}

async function listUsers() {
    return await userRepository.findAll();
}

module.exports = {
    createUser,
    listUsers
};