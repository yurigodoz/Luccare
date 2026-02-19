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
                    type: true,
                    description: true
                }
            },
            log: {
                select: {
                    status: true,
                    notes: true
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