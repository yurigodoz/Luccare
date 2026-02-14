const routineLogRepository = require('../repositories/routineLogRepository');
const routineRepository = require('../repositories/routineRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const BusinessError = require('../errors/BusinessError');
const prisma = require('../database/prisma');

async function upsertScheduleLog(scheduleId, userId, status, notes) {
    const schedule = await prisma.routineSchedule.findUnique({
        where: { id: scheduleId },
        include: { dependent: { include: { users: true } } }
    });

    if (!schedule) throw new BusinessError('Agendamento não encontrado!');

    const hasAccess = schedule.dependent.users.some(u => u.userId === userId);
    if (!hasAccess) throw new BusinessError('Sem permissão!');

    return routineLogRepository.upsertLog(scheduleId, userId, status, notes);
}

async function listByRoutine(routineId, userId) {
    const routine = await routineRepository.findById(routineId);

    if (!routine) throw new BusinessError('Rotina não encontrada');

    const link = await dependentUserRepository.findLink(routine.dependentId, userId);

    if (!link) throw new BusinessError('Você não tem acesso a este dependente');

    return await routineLogRepository.findByRoutine(routineId);
}

module.exports = {
    upsertScheduleLog,
    listByRoutine
};
