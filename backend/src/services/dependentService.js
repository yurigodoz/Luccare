const dependentRepository = require('../repositories/dependentRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const BusinessError = require('../errors/BusinessError');
const { parseDate } = require('../utils/dateUtils');

async function createDependent(data, userId) {
    try {
        if (!data.name) {
            throw new BusinessError('Nome do dependente é obrigatório');
        }

        const dependent = await dependentRepository.create({
            name: data.name,
            birthDate: parseDate(data.birthDate),
            notes: data.notes || null
        });

        await dependentUserRepository.addLink(dependent.id, userId, 'FAMILY');

        await auditLogRepository.create({
            userId,
            action: 'CREATE_DEPENDENT',
            entity: 'Dependent',
            entityId: dependent.id,
            details: dependent
        });

        return dependent;
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no createDependent:', err);
        throw new BusinessError('Erro ao criar dependente.');
    }
}

async function listDependentsByUser(userId) {
    try {
        const links = await dependentUserRepository.findByUser(userId);
        const dependentIds = links.map(l => l.dependentId);

        return dependentRepository.findByIds(dependentIds);
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no listDependentsByUser:', err);
        throw new BusinessError('Erro ao listar dependentes.');
    }
}

async function getDependentById(id, userId) {
    try {
        const link = await dependentUserRepository.findLink(id, userId);
        if (!link) {
            throw new BusinessError('Dependente não encontrado.');
        }

        return dependentRepository.findById(id);
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no getDependentById:', err);
        throw new BusinessError('Erro ao buscar dependente.');
    }
}

async function deleteDependent(id, userId) {
    try {
        const link = await dependentUserRepository.findLink(id, userId);
        if (!link) {
            throw new BusinessError('Dependente não encontrado.');
        }
        if (link.role !== 'FAMILY') {
            throw new BusinessError('Apenas familiares podem excluir dependentes.');
        }

        const dependent = await dependentRepository.findById(id);
        if (!dependent) {
            throw new BusinessError('Dependente não encontrado.');
        }

        await dependentRepository.deleteById(id);

        await auditLogRepository.create({
            userId,
            action: 'DELETE_DEPENDENT',
            entity: 'Dependent',
            entityId: id,
            details: dependent
        });
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no deleteDependent:', err);
        throw new BusinessError('Erro ao excluir dependente.');
    }
}

async function updateDependent(id, data, userId) {
    try {
        const link = await dependentUserRepository.findLink(id, userId);
        if (!link) {
            throw new BusinessError('Dependente não encontrado.');
        }
        if (link.role !== 'FAMILY') {
            throw new BusinessError('Apenas familiares podem editar dependentes.');
        }

        if (!data.name) {
            throw new BusinessError('Nome do dependente é obrigatório');
        }

        const updated = await dependentRepository.update(id, {
            name: data.name,
            birthDate: parseDate(data.birthDate),
            notes: data.notes || null
        });

        await auditLogRepository.create({
            userId,
            action: 'UPDATE_DEPENDENT',
            entity: 'Dependent',
            entityId: id,
            details: updated
        });

        return updated;
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no updateDependent:', err);
        throw new BusinessError('Erro ao atualizar dependente.');
    }
}

module.exports = {
    createDependent,
    listDependentsByUser,
    getDependentById,
    updateDependent,
    deleteDependent
};
