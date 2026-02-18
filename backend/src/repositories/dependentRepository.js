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
    return prisma.dependent.findFirst({
        where: { id, active: true }
    });
}

async function findByIds(ids) {
    return prisma.dependent.findMany({
        where: { id: { in: ids }, active: true }
    });
}

async function update(id, data) {
    return prisma.dependent.update({
        where: { id },
        data
    });
}

async function deleteById(id) {
    return prisma.$transaction(async (tx) => {
        // Desativar rotinas ativas do dependente
        await tx.routine.updateMany({
            where: { dependentId: id, active: true },
            data: { active: false }
        });

        // Soft delete do dependente
        return tx.dependent.update({
            where: { id },
            data: { active: false }
        });
    });
}

module.exports = {
    create,
    findById,
    findByIds,
    update,
    deleteById
};