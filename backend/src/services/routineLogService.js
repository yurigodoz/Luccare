const routineLogRepository = require('../repositories/routineLogRepository');
const routineRepository = require('../repositories/routineRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const BusinessError = require('../errors/BusinessError');
const prisma = require('../database/prisma');

async function updateLogNotes(logId, userId, notes) {
    try {
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
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no updateLogNotes:', err);
        throw new BusinessError('Erro ao atualizar notas do log.');
    }
}

async function listByRoutine(routineId, userId) {
    try {
        const routine = await routineRepository.findById(routineId);

        if (!routine) throw new BusinessError('Rotina não encontrada');

        const link = await dependentUserRepository.findLink(routine.dependentId, userId);

        if (!link) throw new BusinessError('Você não tem acesso a este dependente');

        return await routineLogRepository.findByRoutine(routineId);
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no listByRoutine:', err);
        throw new BusinessError('Erro ao listar logs da rotina.');
    }
}

async function markScheduleDone(scheduleId, userId, notes) {
    try {
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
                routineId: schedule.routineId,
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
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no markScheduleDone:', err);
        throw new BusinessError('Erro ao marcar agendamento como concluído.');
    }
}

module.exports = {
    updateLogNotes,
    listByRoutine,
    markScheduleDone
};
