const prisma = require('../database/prisma');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const routineScheduleRepository = require('../repositories/routineScheduleRepository');
const BusinessError = require('../errors/BusinessError');
const { getTodayForTimezone } = require('../utils/dateUtils');

async function getTodayOverview(userId, timezone) {
    try {
        const today = getTodayForTimezone(timezone);
        const currentDayOfWeek = today.getUTCDay();

        const dependentRoutines = await dependentUserRepository.getDependentRoutinesForToday(userId, currentDayOfWeek);

        if (dependentRoutines.length === 0) {
            return [];
        }

        const routines = dependentRoutines.flatMap(dep => dep.routines);
        await ensureSchedulesExist(routines, today);

        const dependentIds = dependentRoutines.map(dep => dep.dependentId);
        const schedules = await routineScheduleRepository.getTodaySchedules(dependentIds, today);

        return groupSchedulesByDependent(schedules);
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no getTodayOverview:', err);
        throw new BusinessError('Erro ao buscar resumo do dia.');
    }
}

async function ensureSchedulesExist(routines, scheduledDate) {
    if (routines.length === 0) return;

    const schedulesToCreate = routines.flatMap(routine =>
        routine.times.map(routineTime => ({
            dependentId: routine.dependentId,
            routineId: routine.id,
            scheduledDate,
            scheduledTime: routineTime.time,
        }))
    );

    if (schedulesToCreate.length === 0) return;

    await prisma.routineSchedule.createMany({
        data: schedulesToCreate,
        skipDuplicates: true,
    });
}

function groupSchedulesByDependent(schedules) {
    const grouped = {};

    for (const schedule of schedules) {
        const { dependentId } = schedule;

        if (!grouped[dependentId]) {
            grouped[dependentId] = {
                dependentId,
                dependentName: schedule.dependent.name,
                items: []
            };
        }

        grouped[dependentId].items.push({
            scheduleId: schedule.id,
            title: schedule.routine.title,
            description: schedule.routine.description,
            type: schedule.routine.type,
            time: schedule.scheduledTime,
            done: schedule.log !== null,
            status: schedule.log?.status || null,
            notes: schedule.log?.notes || null
        });
    }

    return Object.values(grouped);
}

module.exports = {
    getTodayOverview
};