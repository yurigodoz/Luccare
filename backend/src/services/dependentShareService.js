const dependentUserRepository = require('../repositories/dependentUserRepository');
const userRepository = require('../repositories/userRepository');

function shareDependent(dependentId, ownerId, targetEmail, role) {
    const ownerLinl = dependentUserRepository.findLink(dependentId, ownerId);

    if (!ownerLinl || ownerLinl.role !== 'PARENT') {
        throw new Error('Você não tem permissão para compartilhar este dependente.');
    }

    const targetUser = userRepository.findByEmail(targetEmail);

    if (!targetUser) {
        throw new Error('Usuário não encontrado.');
    }

    const existingLink = dependentUserRepository.findLink(dependentId, targetUser.id);

    if (existingLink) {
        throw new Error('Usuário já possui acesso a este dependente.');
    }

    return dependentUserRepository.addLink(dependentId, targetUser.id, role);
}

module.exports = { shareDependent };