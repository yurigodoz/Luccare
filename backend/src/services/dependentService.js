const dependentRepository = require('../repositories/dependentRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const BusinessError = require('../errors/BusinessError');

async function createDependent(data, userId) {
    try {
        if (!data.name) {
            throw new BusinessError('Nome do dependente é obrigatório');
        }

        const dependent = await dependentRepository.create({
            name: data.name,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            notes: data.notes || ''
        });

        await dependentUserRepository.addLink(dependent.id, userId, 'FAMILY');

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

module.exports = {
    createDependent,
    listDependentsByUser
};
