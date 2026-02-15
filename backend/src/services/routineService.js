const routineRepository = require('../repositories/routineRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const BusinessError = require('../errors/BusinessError');

async function createRoutine(data, dependentId, userId) {
    try {
        dependentId = Number(dependentId);
        userId = Number(userId);

        if (!Number.isInteger(dependentId) || !Number.isInteger(userId)) {
            throw new BusinessError('IDs inválidos. Token ou parâmetros corrompidos.');
        }

        const link = await dependentUserRepository.findLink(dependentId, userId);

        if (!link) throw new BusinessError('Você não tem acesso a este dependente');
        if (!['FAMILY', 'CAREGIVER'].includes(link.role))
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
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no createRoutine:', err);
        throw new BusinessError('Erro ao criar rotina.');
    }
}

async function listRoutines(dependentId, userId) {
    try {
        const link = await dependentUserRepository.findLink(dependentId, userId);

        if (!link) throw new BusinessError('Você não tem acesso a este dependente');

        return routineRepository.findByDependent(dependentId);
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no listRoutines:', err);
        throw new BusinessError('Erro ao listar rotinas.');
    }
}

async function deleteRoutine(routineId, userId) {
    try {
        routineId = Number(routineId);
        userId = Number(userId);

        const routine = await routineRepository.findById(routineId);
        if (!routine) {
            throw new BusinessError('Rotina não encontrada.');
        }

        const link = await dependentUserRepository.findLink(routine.dependentId, userId);
        if (!link) throw new BusinessError('Você não tem acesso a este dependente.');
        if (!['FAMILY', 'CAREGIVER'].includes(link.role)) {
            throw new BusinessError('Sem permissão para excluir rotinas.');
        }

        await routineRepository.deleteById(routineId);

        await auditLogRepository.create({
            userId,
            action: 'DELETE_ROUTINE',
            entity: 'Routine',
            entityId: routineId,
            details: routine
        });
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no deleteRoutine:', err);
        throw new BusinessError('Erro ao excluir rotina.');
    }
}

module.exports = {
    createRoutine,
    listRoutines,
    deleteRoutine
};