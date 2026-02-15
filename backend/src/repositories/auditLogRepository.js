const prisma = require('../database/prisma');

async function create({ userId, action, entity, entityId, details }) {
    return prisma.auditLog.create({
        data: { userId, action, entity, entityId, details }
    });
}

module.exports = { create };
