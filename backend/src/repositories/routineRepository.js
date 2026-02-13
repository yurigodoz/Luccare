const prisma = require('../database/prisma');

function flattenRoutine(routine) {
    if (!routine) return routine;
    return {
        ...routine,
        times: routine.times.map(t => t.time),
        daysOfWeek: routine.daysOfWeek.map(d => d.dayOfWeek)
    };
}

async function create(routine) {
    const result = await prisma.routine.create({
        data: {
            dependentId: routine.dependentId,
            type: routine.type,
            title: routine.title,
            description: routine.description,
            active: routine.active,
            createdBy: routine.createdBy,
            times: {
                create: routine.times.map(t => ({ time: t }))
            },
            daysOfWeek: {
                create: routine.daysOfWeek.map(d => ({ dayOfWeek: d }))
            }
        },
        include: {
            times: true,
            daysOfWeek: true
        }
    });
    return flattenRoutine(result);
}

async function findByDependent(dependentId) {
    const routines = await prisma.routine.findMany({
        where: { dependentId, active: true },
        include: {
            times: true,
            daysOfWeek: true
        }
    });
    return routines.map(flattenRoutine);
}

async function findById(id) {
    const routine = await prisma.routine.findUnique({
        where: { id },
        include: {
            times: true,
            daysOfWeek: true
        }
    });
    return flattenRoutine(routine);
}

module.exports = {
    create,
    findByDependent,
    findById
};
