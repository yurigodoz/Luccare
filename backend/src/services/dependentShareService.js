const dependentUserRepository = require('../repositories/dependentUserRepository');
const userRepository = require('../repositories/userRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const BusinessError = require('../errors/BusinessError');

async function shareDependent(dependentId, ownerId, targetEmail, role) {
    try {
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

        const link = await dependentUserRepository.addLink(dependentId, targetUser.id, role);

        await auditLogRepository.create({
            userId: ownerId,
            action: 'SHARE_DEPENDENT',
            entity: 'DependentUser',
            entityId: dependentId,
            details: { targetUserId: targetUser.id, targetEmail, role }
        });

        return link;
    } catch (err) {
        if (err instanceof BusinessError) throw err;
        
        console.log('Erro no shareDependent:', err);
        throw new BusinessError('Erro ao compartilhar dependente.');
    }
}

async function listUsers(dependentId, userId) {
    try {
        const link = await dependentUserRepository.findLink(dependentId, userId);
        if (!link) throw new BusinessError('Você não tem acesso a este dependente.');

        const links = await dependentUserRepository.findByDependent(Number(dependentId));

        return links.map(l => ({
            userId: l.user.id,
            name: l.user.name,
            email: l.user.email,
            role: l.role,
        }));
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no listUsers:', err);
        throw new BusinessError('Erro ao listar usuários.');
    }
}

async function revokeAccess(dependentId, targetUserId, userId) {
    try {
        dependentId = Number(dependentId);
        targetUserId = Number(targetUserId);
        userId = Number(userId);

        const ownerLink = await dependentUserRepository.findLink(dependentId, userId);
        if (!ownerLink || ownerLink.role !== 'FAMILY') {
            throw new BusinessError('Você não tem permissão para revogar acesso.');
        }

        if (targetUserId === userId) {
            throw new BusinessError('Você não pode remover seu próprio acesso.');
        }

        const targetLink = await dependentUserRepository.findLink(dependentId, targetUserId);
        if (!targetLink) {
            throw new BusinessError('Usuário não possui acesso a este dependente.');
        }

        await dependentUserRepository.removeLink(dependentId, targetUserId);

        await auditLogRepository.create({
            userId,
            action: 'REVOKE_DEPENDENT_ACCESS',
            entity: 'DependentUser',
            entityId: dependentId,
            details: { targetUserId, role: targetLink.role }
        });
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no revokeAccess:', err);
        throw new BusinessError('Erro ao revogar acesso.');
    }
}

module.exports = { shareDependent, listUsers, revokeAccess };