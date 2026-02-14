const prisma = require('../database/prisma');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const routineScheduleRepository = require('../repositories/routineScheduleRepository');

async function getTodayOverview(userId) {
    const today = getStartOfDay(new Date());
    const currentDayOfWeek = today.getDay();

    const dependentRoutines = await dependentUserRepository.getDependentRoutinesForToday(userId, currentDayOfWeek);

    if (dependentRoutines.length === 0) {
        return [];
    }

    const routines = dependentRoutines.flatMap(dep => dep.routines);
    await ensureSchedulesExist(routines, today);

    const dependentIds = dependentRoutines.map(dep => dep.dependentId);
    const schedules = await routineScheduleRepository.getTodaySchedules(dependentIds, today);

    return groupSchedulesByDependent(schedules);
}

function getStartOfDay(date) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
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
            type: schedule.routine.type,
            time: schedule.scheduledTime,
            done: schedule.logs.length > 0,
            status: schedule.logs[0]?.status || null
        });
    }

    return Object.values(grouped);
}

module.exports = {
    getTodayOverview
};