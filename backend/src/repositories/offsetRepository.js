const prisma = require('../database/prisma');

async function upsertOffset(dependentId, date, type, offsetHours, userId) {
    return prisma.dependentDayTypeOffset.upsert({
        where: {
            dependentId_date_type: { dependentId, date, type }
        },
        update: { offsetHours, setBy: userId },
        create: { dependentId, date, type, offsetHours, setBy: userId }
    });
}

async function deleteOffset(dependentId, date, type) {
    return prisma.dependentDayTypeOffset.deleteMany({
        where: { dependentId, date, type }
    });
}

async function getOffsetsByDate(dependentIds, date) {
    return prisma.dependentDayTypeOffset.findMany({
        where: {
            dependentId: { in: dependentIds },
            date
        },
        select: {
            dependentId: true,
            type: true,
            offsetHours: true
        }
    });
}

module.exports = {
    upsertOffset,
    deleteOffset,
    getOffsetsByDate
};
