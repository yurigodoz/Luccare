const prisma = require('../database/prisma');
const dependentUserRepository = require('../repositories/dependentUserRepository');

async function getTodayOverview(userId) {
    const links = await dependentUserRepository.findByUser(userId);
    const dependentIds = links.map(l => l.dependentId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const routines = await prisma.routine.findMany({
        where: {
            dependentId: { in: dependentIds },
            active: true,
            daysOfWeek: { has: today.getDay() }
        }
    });

    for (const r of routines) {
        for (const time of r.times) {
            await prisma.routineSchedule.upsert({
                where: {
                    dependentId_scheduledDate_scheduledTime_routineId: {
                        dependentId: r.dependentId,
                        scheduledDate: today,
                        scheduledTime: time,
                        routineId: r.id,
                    }
                },
                create: {
                    dependentId: r.dependentId,
                    routineId: r.id,
                    scheduledDate: today,
                    scheduledTime: time,
                },
                update: {}
            });
        }
    }

    const schedules = await prisma.routineSchedule.findMany({
        where: {
            dependentId: { in: dependentIds },
            scheduledDate: today,
        },
        include: {
            routine: true,
            logs: true,
            dependent: true,
        },
        orderBy: {
            scheduledTime: 'asc'
        }
    });

    const grouped = {};

    for (const s of schedules) {
        if (!grouped[s.dependentId]) {
            grouped[s.dependentId] = {
                dependentId: s.dependentId,
                dependentName: s.dependent.name,
                items: []
            };
        }

        grouped[s.dependentId].items.push({
            scheduleId: s.id,
            title: s.routine.title,
            time: s.scheduledTime,
            done: s.logs.length > 0
        });
    }

    return Object.values(grouped);
}

module.exports = {
    getTodayOverview
};
