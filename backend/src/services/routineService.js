const routineRepository = require('../repositories/routineRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const prisma = require('../database/prisma');
const BusinessError = require('../errors/BusinessError');
const { getUTCToday, isValidTimeString } = require('../utils/dateUtils');

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

        validateRoutineTimes(data.times);

        const routine = await routineRepository.create({
            dependentId,
            type: data.type,
            title: data.title,
            description: data.description,
            times: data.times,
            daysOfWeek: data.daysOfWeek,
            active: true,
            createdBy: userId
        });

        await auditLogRepository.create({
            userId,
            action: 'CREATE_ROUTINE',
            entity: 'Routine',
            entityId: routine.id,
            details: routine
        });

        return routine;
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

async function getRoutine(routineId, userId) {
    try {
        routineId = Number(routineId);
        userId = Number(userId);

        const routine = await routineRepository.findById(routineId);
        if (!routine) {
            throw new BusinessError('Rotina não encontrada.');
        }

        const link = await dependentUserRepository.findLink(routine.dependentId, userId);
        if (!link) throw new BusinessError('Você não tem acesso a este dependente.');

        return routine;
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no getRoutine:', err);
        throw new BusinessError('Erro ao buscar rotina.');
    }
}

async function updateRoutine(routineId, data, userId) {
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
            throw new BusinessError('Sem permissão para editar rotinas.');
        }

        validateRoutineTimes(data.times);

        const updated = await routineRepository.updateById(routineId, {
            type: data.type,
            title: data.title,
            description: data.description,
            times: data.times,
            daysOfWeek: data.daysOfWeek,
        });

        await auditLogRepository.create({
            userId,
            action: 'UPDATE_ROUTINE',
            entity: 'Routine',
            entityId: routineId,
            details: { before: routine, after: updated }
        });

        return updated;
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no updateRoutine:', err);
        throw new BusinessError('Erro ao atualizar rotina.');
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

        const today = getUTCToday();

        // Buscar dados que serão deletados antes da exclusão
        const deletedSchedules = await prisma.routineSchedule.findMany({
            where: {
                routineId,
                scheduledDate: { gte: today },
                log: null,
            }
        });

        const deletedLogs = await prisma.routineLog.findMany({
            where: {
                schedule: {
                    routineId,
                    scheduledDate: { gte: today },
                },
                status: 'SKIPPED',
            }
        });

        await routineRepository.deleteById(routineId);

        // Um log para cada entidade deletada
        await auditLogRepository.create({
            userId,
            action: 'DELETE_ROUTINE',
            entity: 'Routine',
            entityId: routineId,
            details: { id: routine.id, dependentId: routine.dependentId, type: routine.type, title: routine.title, description: routine.description, active: routine.active, createdBy: routine.createdBy }
        });

        await auditLogRepository.create({
            userId,
            action: 'DELETE_ROUTINE',
            entity: 'RoutineTime',
            entityId: routineId,
            details: routine.times
        });

        await auditLogRepository.create({
            userId,
            action: 'DELETE_ROUTINE',
            entity: 'RoutineDayOfWeek',
            entityId: routineId,
            details: routine.daysOfWeek
        });

        if (deletedSchedules.length > 0) {
            await auditLogRepository.create({
                userId,
                action: 'DELETE_ROUTINE',
                entity: 'RoutineSchedule',
                entityId: routineId,
                details: deletedSchedules
            });
        }

        if (deletedLogs.length > 0) {
            await auditLogRepository.create({
                userId,
                action: 'DELETE_ROUTINE',
                entity: 'RoutineLog',
                entityId: routineId,
                details: deletedLogs
            });
        }
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no deleteRoutine:', err);
        throw new BusinessError('Erro ao excluir rotina.');
    }
}

function validateRoutineTimes(times) {
    if (!Array.isArray(times) || times.length === 0) {
        throw new BusinessError('É necessário informar ao menos um horário.');
    }
    for (const time of times) {
        if (!isValidTimeString(time)) {
            throw new BusinessError(`Horário inválido: "${time}". Use o formato HH:mm.`);
        }
    }
}

module.exports = {
    createRoutine,
    listRoutines,
    getRoutine,
    updateRoutine,
    deleteRoutine
};