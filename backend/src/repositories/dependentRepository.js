const prisma = require('../database/prisma');

async function create(dependent) {
    return prisma.dependent.create({
        data: {
        name: dependent.name,
        birthDate: dependent.birthDate,
        notes: dependent.notes
        }
    });
}

async function findById(id) {
    return prisma.dependent.findUnique({
        where: { id }
    });
}

async function findByIds(ids) {
    return prisma.dependent.findMany({
        where: { id: { in: ids } }
    });
}

module.exports = {
    create,
    findById,
    findByIds
};