const prisma = require('../database/prisma');

async function create(log) {
    return prisma.routineLog.create({
        data: {
            routineId: log.routineId,
            dateTime: log.dateTime,
            status: log.status,
            doneBy: log.doneBy,
            notes: log.notes
        }
    });
}

async function findByRoutine(routineId) {
    return prisma.routineLog.findMany({
        where: { routineId },
        orderBy: { dateTime: 'desc' }
    });
}

module.exports = {
    create,
    findByRoutine
};
