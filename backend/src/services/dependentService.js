const dependentRepository = require('../repositories/dependentRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');

async function createDependent(data, userId) {
    if (!data.name) {
        throw new Error('Nome do dependente é obrigatório');
    }

    const dependent = await dependentRepository.create({
        name: data.name,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes || ''
    });

    await dependentUserRepository.addLink(dependent.id, userId, 'PARENT');

    return dependent;
}

async function listDependentsByUser(userId) {
    const links = await dependentUserRepository.findByUser(userId);
    const dependentIds = links.map(l => l.dependentId);

    return dependentRepository.findByIds(dependentIds);
}

module.exports = {
    createDependent,
    listDependentsByUser
};
