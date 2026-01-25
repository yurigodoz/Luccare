const prisma = require('../database/prisma');
const dependentUserRepository = require('../repositories/dependentUserRepository');

async function getTodayOverview(userId) {
    const links = await dependentUserRepository.findByUser(userId);
    const dependentIds = links.map(l => l.dependentId);

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0..6

    const routines = await prisma.routine.findMany({
        where: {
                dependentId: { in: dependentIds },
                active: true,
                daysOfWeek: { has: dayOfWeek }
            },
            include: {
                logs: {
                where: {
                    dateTime: {
                        gte: new Date(today.toDateString())
                    }
                }
            }
        }
    });

    const result = routines.map(r => {
    const doneToday = r.logs.length > 0;
    return {
        routineId: r.id,
        title: r.title,
        dependentId: r.dependentId,
        times: r.times,
        doneToday
        };
    });

    return result;
}

module.exports = {
    getTodayOverview
};
