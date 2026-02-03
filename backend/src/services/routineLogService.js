const routineLogRepository = require('../repositories/routineLogRepository');
const routineRepository = require('../repositories/routineRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const BusinessError = require('../errors/BusinessError');
const prisma = require('../database/prisma');

async function registerExecution(routineId, userId, status, notes) {
    const routine = await routineRepository.findById(routineId);
    
    if (!routine) throw new BusinessError('Rotina não encontrada');

    const link = await dependentUserRepository.findLink(routine.dependentId, userId);
    
    if (!link) throw new BusinessError('Você não tem acesso a este dependente');
    
    if (!['PARENT', 'CAREGIVER'].includes(link.role))
        throw new BusinessError('Sem permissão para registrar execução');

    return routineLogRepository.create({
        routineId,
        dateTime: new Date(),
        status,
        doneBy: userId,
        notes
    });
}

async function updateLogNotes(logId, userId, notes) {
    const log = await routineLogRepository.findById(logId);

    if (!log) {
        throw new BusinessError('Log não encontrado');
    }

    const hasAccess = log.routine.dependent.users.some(
        link => link.userId === userId
    );

    if (!hasAccess) {
        throw new BusinessError('Você não tem permissão para alterar este log.');
    }

    return routineLogRepository.updateNotes(logId, notes);
}

async function listByRoutine(routineId, userId) {
    const routine = await routineRepository.findById(routineId);
    console.log(routine);
    
    if (!routine) throw new BusinessError('Rotina não encontrada');

    const link = await dependentUserRepository.findLink(routine.dependentId, userId);
    console.log(link);
    
    if (!link) throw new BusinessError('Você não tem acesso a este dependente');

    return await routineLogRepository.findByRoutine(routineId);
}

async function markScheduleDone(scheduleId, userId, notes) {
    const schedule = await prisma.routineSchedule.findUnique({
        where: { id: scheduleId },
        include: {
            dependent: {
                include: {
                    users: true
                }
            }
        }
    });

    if (!schedule) {
        throw new BusinessError('Agendamento não encontrado!');
    }

    const hasAccess = schedule.dependent.users.some(
        u => u.userId === userId
    );

    if (!hasAccess) {
        throw new BusinessError('Sem permissão!');
    }

    return prisma.routineLog.upsert({
        where: { scheduleId },
        create: {
            scheduleId,
            status: 'DONE',
            notes,
            doneBy: userId,
        },
        update: {
            status: 'DONE',
            notes,
            doneBy: userId,
        }
    });
}

module.exports = {
    registerExecution,
    updateLogNotes,
    listByRoutine,
    markScheduleDone
};
