const prisma = require('../database/prisma');
const { getUTCToday, computeDaysRemaining } = require('../utils/dateUtils');

function flattenRoutine(routine, today) {
    if (!routine) return routine;
    const flat = {
        ...routine,
        times: routine.times.map(t => t.time),
        daysOfWeek: routine.daysOfWeek.map(d => d.dayOfWeek)
    };
    if (flat.isTemporary && flat.startDate && flat.endDate) {
        flat.durationDays = computeDaysRemaining(flat.endDate, flat.startDate) + 1;
        if (today) {
            flat.daysRemaining = computeDaysRemaining(flat.endDate, today);
        }
    }
    return flat;
}

async function create(routine) {
    const result = await prisma.routine.create({
        data: {
            dependentId: routine.dependentId,
            type: routine.type,
            title: routine.title,
            description: routine.description,
            active: routine.active,
            createdBy: routine.createdBy,
            isTemporary: routine.isTemporary ?? false,
            startDate: routine.startDate ?? null,
            endDate: routine.endDate ?? null,
            times: {
                create: routine.times.map(t => ({ time: t }))
            },
            daysOfWeek: {
                create: routine.daysOfWeek.map(d => ({ dayOfWeek: d }))
            }
        },
        include: {
            times: true,
            daysOfWeek: true
        }
    });
    return flattenRoutine(result);
}

async function findByDependent(dependentId, today) {
    const routines = await prisma.routine.findMany({
        where: {
            dependentId,
            active: true,
            OR: [
                { isTemporary: false },
                { isTemporary: true, startDate: { lte: today }, endDate: { gte: today } }
            ]
        },
        include: {
            times: true,
            daysOfWeek: true
        }
    });
    return routines.map(r => flattenRoutine(r, today));
}

async function findById(id) {
    const routine = await prisma.routine.findUnique({
        where: { id },
        include: {
            times: true,
            daysOfWeek: true
        }
    });
    return flattenRoutine(routine);
}

async function updateById(id, data) {
    return prisma.$transaction(async (tx) => {
        // Recriar times e daysOfWeek
        await tx.routineTime.deleteMany({ where: { routineId: id } });
        await tx.routineDayOfWeek.deleteMany({ where: { routineId: id } });

        // Remover schedules futuros (a partir de hoje) que não têm log,
        // para que o ensureSchedulesExist os recrie com os novos horários
        const today = getUTCToday();

        await tx.routineSchedule.deleteMany({
            where: {
                routineId: id,
                scheduledDate: { gte: today },
                log: null,
            }
        });

        const result = await tx.routine.update({
            where: { id },
            data: {
                type: data.type,
                title: data.title,
                description: data.description ?? null,
                isTemporary: data.isTemporary,
                startDate: data.startDate,
                endDate: data.endDate,
                times: {
                    create: data.times.map(t => ({ time: t }))
                },
                daysOfWeek: {
                    create: data.daysOfWeek.map(d => ({ dayOfWeek: d }))
                }
            },
            include: {
                times: true,
                daysOfWeek: true
            }
        });
        return flattenRoutine(result);
    });
}

async function deleteById(id) {
    return prisma.$transaction(async (tx) => {
        const today = getUTCToday();

        // Deletar logs de schedules futuros sem execução registrada
        await tx.routineLog.deleteMany({
            where: {
                schedule: {
                    routineId: id,
                    scheduledDate: { gte: today },
                },
                status: 'SKIPPED',
            }
        });

        // Deletar schedules futuros sem log (preserva histórico)
        await tx.routineSchedule.deleteMany({
            where: {
                routineId: id,
                scheduledDate: { gte: today },
                log: null,
            }
        });

        // Soft delete da rotina (times e daysOfWeek removidos via cascade conceitual)
        await tx.routineTime.deleteMany({ where: { routineId: id } });
        await tx.routineDayOfWeek.deleteMany({ where: { routineId: id } });

        return tx.routine.update({
            where: { id },
            data: { active: false }
        });
    });
}

module.exports = {
    create,
    findByDependent,
    findById,
    updateById,
    deleteById
};
