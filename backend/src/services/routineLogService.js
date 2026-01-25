const routineLogRepository = require('../repositories/routineLogRepository');
const routineRepository = require('../repositories/routineRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');

async function registerExecution(routineId, userId, status, notes) {
    const routine = await routineRepository.findById(routineId);
    
    if (!routine) throw new Error('Rotina não encontrada');

    const link = await dependentUserRepository.findLink(routine.dependentId, userId);
    
    if (!link) throw new Error('Você não tem acesso a este dependente');
    
    if (!['PARENT', 'CAREGIVER'].includes(link.role))
        throw new Error('Sem permissão para registrar execução');

    return routineLogRepository.create({
        routineId,
        dateTime: new Date(),
        status,
        doneBy: userId,
        notes
    });
}

async function listByRoutine(routineId, userId) {
    const routine = await routineRepository.findById(routineId);
    
    if (!routine) throw new Error('Rotina não encontrada');

    const link = await dependentUserRepository.findLink(routine.dependentId, userId);
    
    if (!link) throw new Error('Você não tem acesso a este dependente');

    return routineLogRepository.findByRoutine(routineId);
}

module.exports = {
    registerExecution,
    listByRoutine
};
