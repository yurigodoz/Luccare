const offsetRepository = require('../repositories/offsetRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');
const auditLogRepository = require('../repositories/auditLogRepository');
const BusinessError = require('../errors/BusinessError');
const { getTodayForTimezone } = require('../utils/dateUtils');

async function setOffset(dependentId, type, offsetHours, userId, timezone) {
    try {
        dependentId = Number(dependentId);
        userId = Number(userId);
        offsetHours = Number(offsetHours);

        if (!Number.isInteger(dependentId) || !Number.isInteger(userId)) {
            throw new BusinessError('IDs inválidos.');
        }

        if (!Number.isInteger(offsetHours) || offsetHours < -12 || offsetHours > 12) {
            throw new BusinessError('Offset deve ser um inteiro entre -12 e 12.');
        }

        const link = await dependentUserRepository.findLink(dependentId, userId);
        if (!link) throw new BusinessError('Você não tem acesso a este dependente.');

        const today = getTodayForTimezone(timezone);

        if (offsetHours === 0) {
            await offsetRepository.deleteOffset(dependentId, today, type);
            await auditLogRepository.create({
                userId,
                action: 'RESET_DAY_OFFSET',
                entity: 'DependentDayTypeOffset',
                entityId: dependentId,
                details: { dependentId, type, offsetHours: 0, date: today }
            });
            return { dependentId, type, offsetHours: 0 };
        }

        await offsetRepository.upsertOffset(dependentId, today, type, offsetHours, userId);
        await auditLogRepository.create({
            userId,
            action: 'SET_DAY_OFFSET',
            entity: 'DependentDayTypeOffset',
            entityId: dependentId,
            details: { dependentId, type, offsetHours, date: today }
        });
        return { dependentId, type, offsetHours };
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no setOffset:', err);
        throw new BusinessError('Erro ao definir offset.');
    }
}

async function getTodayOffsets(userId, timezone) {
    try {
        userId = Number(userId);

        const dependentLinks = await dependentUserRepository.findByUser(userId);
        if (dependentLinks.length === 0) return [];

        const dependentIds = dependentLinks.map(l => l.dependentId);
        const today = getTodayForTimezone(timezone);

        return offsetRepository.getOffsetsByDate(dependentIds, today);
    } catch (err) {
        if (err instanceof BusinessError) throw err;

        console.log('Erro no getTodayOffsets:', err);
        throw new BusinessError('Erro ao buscar offsets.');
    }
}

module.exports = {
    setOffset,
    getTodayOffsets
};
