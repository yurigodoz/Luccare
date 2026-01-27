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

async function updateNotes(logId, notes) {
    return prisma.routineLog.update({
        where: { id: logId },
        data: { notes },
    });
}


async function findByRoutine(routineId) {
    return prisma.routineLog.findMany({
        where: { routineId },
        orderBy: { dateTime: 'desc' }
    });
}

async function findById(id) {
    return prisma.routineLog.findUnique({
        where: { id },
        include: {
            routine: {
                include: {
                    dependent: {
                        include: {
                            users: true, // relação DependentUser
                        },
                    },
                },
            },
        },
    });
}

module.exports = {
    create,
    updateNotes,
    findByRoutine,
    findById
};
