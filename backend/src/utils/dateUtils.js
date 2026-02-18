const BusinessError = require('../errors/BusinessError');

/**
 * Retorna a data de "hoje" no fuso horário do usuário, como UTC meia-noite.
 * Garante que o "hoje" corresponda ao dia real do usuário, não do servidor.
 * O timezone é populado pelo timezoneMiddleware (fallback: America/Sao_Paulo).
 */
function getTodayForTimezone(timezone) {
    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: timezone });
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Retorna a data de "hoje" em UTC puro (baseado no relógio do servidor).
 * Usar apenas para operações que não dependem do timezone do usuário
 * (ex: limpar schedules futuros).
 */
function getUTCToday() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Converte uma string de data (YYYY-MM-DD) para Date em UTC meia-noite.
 * Mesmo padrão usado por getTodayForTimezone e compatível com campos @db.Date.
 */
function parseDate(dateStr) {
    if (!dateStr) return null;
    if (!isValidDateString(dateStr)) {
        throw new BusinessError('Formato de data inválido. Use YYYY-MM-DD.');
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Valida se a string está no formato YYYY-MM-DD e representa uma data real.
 */
function isValidDateString(dateStr) {
    if (typeof dateStr !== 'string') return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year
        && date.getMonth() === month - 1
        && date.getDate() === day;
}

/**
 * Valida se a string está no formato HH:mm (00:00 a 23:59).
 */
function isValidTimeString(timeStr) {
    if (typeof timeStr !== 'string') return false;
    if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;

    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

module.exports = {
    getTodayForTimezone,
    getUTCToday,
    parseDate,
    isValidDateString,
    isValidTimeString
};
