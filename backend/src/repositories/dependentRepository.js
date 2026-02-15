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

async function deleteById(id) {
    return prisma.$transaction(async (tx) => {
        // Deletar logs dos schedules deste dependente
        await tx.routineLog.deleteMany({
            where: { schedule: { dependentId: id } }
        });

        // Deletar schedules
        await tx.routineSchedule.deleteMany({
            where: { dependentId: id }
        });

        // Deletar rotinas (times e daysOfWeek têm onDelete: Cascade)
        await tx.routine.deleteMany({
            where: { dependentId: id }
        });

        // Deletar links de acesso
        await tx.dependentUser.deleteMany({
            where: { dependentId: id }
        });

        // Deletar o dependente
        return tx.dependent.delete({
            where: { id }
        });
    });
}

module.exports = {
    create,
    findById,
    findByIds,
    deleteById
};