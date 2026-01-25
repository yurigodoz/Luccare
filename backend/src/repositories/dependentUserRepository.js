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

module.exports = {
    addLink,
    findByUser,
    findByDependent,
    findLink
};