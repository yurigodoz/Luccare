const prisma = require('../database/prisma');

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

module.exports = {
    getTodaySchedules
};