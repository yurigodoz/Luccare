const dependentUserRepository = require('../repositories/dependentUserRepository');
const userRepository = require('../repositories/userRepository');
const BusinessError = require('../errors/BusinessError');

async function shareDependent(dependentId, ownerId, targetEmail, role) {
    const ownerLink = await dependentUserRepository.findLink(dependentId, ownerId);

    if (!ownerLink || ownerLink.role !== 'FAMILY') {
        throw new BusinessError('Você não tem permissão para compartilhar este dependente.');
    }

    const targetUser = await userRepository.findByEmail(targetEmail);

    if (!targetUser) {
        throw new BusinessError('Usuário não encontrado.');
    }

    const existingLink = await dependentUserRepository.findLink(dependentId, targetUser.id);

    if (existingLink) {
        throw new BusinessError('Usuário já possui acesso a este dependente.');
    }

    return await dependentUserRepository.addLink(dependentId, targetUser.id, role);
}

module.exports = { shareDependent };