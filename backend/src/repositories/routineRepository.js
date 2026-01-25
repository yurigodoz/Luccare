const prisma = require('../database/prisma');

async function create(routine) {
    return prisma.routine.create({
        data: {
            dependentId: routine.dependentId,
            type: routine.type,
            title: routine.title,
            description: routine.description,
            times: routine.times,
            daysOfWeek: routine.daysOfWeek,
            active: routine.active,
            createdBy: routine.createdBy
        }
    });
}

async function findByDependent(dependentId) {
    return prisma.routine.findMany({
        where: { dependentId, active: true }
    });
}

async function findById(id) {
    return prisma.routine.findUnique({
        where: { id }
    });
}

module.exports = {
    create,
    findByDependent,
    findById
};
