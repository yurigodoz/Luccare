const routineRepository = require('../repositories/routineRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const BusinessError = require('../errors/BusinessError');

async function createRoutine(data, dependentId, userId) {
    dependentId = Number(dependentId);
    userId = Number(userId);

    if (!Number.isInteger(dependentId) || !Number.isInteger(userId)) {
        throw new BusinessError('IDs inválidos. Token ou parâmetros corrompidos.');
    }
    
    const link = await dependentUserRepository.findLink(dependentId, userId);

    if (!link) throw new BusinessError('Você não tem acesso a este dependente');
    if (!['PARENT', 'CAREGIVER'].includes(link.role))
        throw new BusinessError('Sem permissão para criar rotinas');

    return routineRepository.create({
        dependentId,
        type: data.type,
        title: data.title,
        description: data.description,
        times: data.times,
        daysOfWeek: data.daysOfWeek,
        active: true,
        createdBy: userId
    });
}

async function listRoutines(dependentId, userId) {
    const link = await dependentUserRepository.findLink(dependentId, userId);
    
    if (!link) throw new BusinessError('Você não tem acesso a este dependente');

    return routineRepository.findByDependent(dependentId);
}

module.exports = {
    createRoutine,
    listRoutines
};