const prisma = require('../database/prisma');

async function addLink(dependentId, userId, role) {
    return prisma.dependentUser.create({
        data: {
            dependentId,
            userId,
            role
        }
    });
}

async function findByUser(userId) {
    return prisma.dependentUser.findMany({
        where: { userId }
    });
}

async function findByDependent(dependentId) {
    return prisma.dependentUser.findMany({
        where: { dependentId }
    });
}

async function findLink(dependentId, userId) {
    return prisma.dependentUser.findUnique({
        where: {
            userId_dependentId: {
                userId:  Number(userId),
                dependentId: Number(dependentId)
            }
        }
    });
}

async function getDependentRoutinesForToday(userId, dayOfWeek) {
    return prisma.dependentUser.findMany({
        where: { userId },
        select: {
            dependentId: true,
            dependent: {
                select: {
                    routines: {
                        where: {
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
                    }
                }
            }
        }
    }).then(deps =>
        deps.map(dep => ({
            dependentId: dep.dependentId,
            routines: dep.dependent.routines
        }))
    );
}

module.exports = {
    addLink,
    findByUser,
    findByDependent,
    findLink,
    getDependentRoutinesForToday
};