const prisma = require('../database/prisma');
const dependentUserRepository = require('../repositories/dependentUserRepository');

async function getTodayOverview(userId) {
    const today = getStartOfDay(new Date());
    const currentDayOfWeek = today.getDay();

    const dependentIds = await getDependentIds(userId);

    if (dependentIds.length === 0) {
        return [];
    }

    const routines = await getActiveRoutinesForToday(dependentIds, currentDayOfWeek);
    await ensureSchedulesExist(routines, today);

    const schedules = await getTodaySchedules(dependentIds, today);

    return groupSchedulesByDependent(schedules);
}

function getStartOfDay(date) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
}

async function getDependentIds(userId) {
    const links = await dependentUserRepository.findByUser(userId);
    return links.map(link => link.dependentId);
}

async function getActiveRoutinesForToday(dependentIds, dayOfWeek) {
    return prisma.routine.findMany({
        where: {
            dependentId: { in: dependentIds },
            active: true,
            daysOfWeek: {
                some: {
                    dayOfWeek: dayOfWeek
                }
            }
        },
        select: {
            id: true,
            dependentId: true,
            times: {
                select: {
                    time: true
                },
                orderBy: {
                    time: 'asc'
                }
            }
        }
    });
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

async function getTodaySchedules(dependentIds, scheduledDate) {
    return prisma.routineSchedule.findMany({
        where: {
            dependentId: { in: dependentIds },
            scheduledDate,
        },
        include: {
            routine: {
                select: {
                    title: true,
                    type: true
                }
            },
            logs: {
                select: {
                    id: true,
                    status: true
                },
                take: 1,
                orderBy: {
                    dateTime: 'desc'
                }
            },
            dependent: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            scheduledTime: 'asc'
        }
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
