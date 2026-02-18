const prisma = require('../database/prisma');

async function upsertLog(scheduleId, userId, status, notes) {
    return prisma.routineLog.upsert({
        where: { scheduleId },
        create: { scheduleId, status, notes, doneBy: userId },
        update: { status, notes, doneBy: userId, dateTime: new Date() }
    });
}

async function findByRoutine(routineId) {
    return prisma.routineLog.findMany({
        where: { schedule: { routineId } },
        orderBy: { dateTime: 'desc' }
    });
}

async function deleteLog(scheduleId) {
    return prisma.routineLog.delete({
        where: { scheduleId }
    });
}

module.exports = { upsertLog, findByRoutine, deleteLog };
