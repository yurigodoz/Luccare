const routineRepository = require('../repositories/routineRepository');
const routineLogRepository = require('../repositories/routineLogRepository');
const dependentUserRepository = require('../repositories/dependentUserRepository');

function getTodayRoutines(userId) {
    const links = dependentUserRepository.findByUser(userId);
    const dependentIds = links.map(l => l.dependentId);

    const now = new Date();
    const today = now.getDay();
    const todayStr = now.toISOString().slice(0, 10); // yyyy-mm-dd

    let result = [];

    dependentIds.forEach(depId => {
        const routines = routineRepository.findByDependent(depId);

        const todayRoutines = routines.filter(r =>
            r.active && r.daysOfWeek.includes(today)
        );

        todayRoutines.forEach(r => {
            const logs = routineLogRepository.findByRoutine(r.id);

            r.times.forEach(time => {
                const [hour, minute] = time.split(':');
                const scheduled = new Date(now);
                scheduled.setHours(hour, minute, 0, 0);

                const doneLog = logs.find(l =>
                    l.status === 'DONE' &&
                    l.dateTime.toISOString().slice(0, 10) === todayStr &&
                    Math.abs(new Date(l.dateTime) - scheduled) < 60 * 60 * 1000
                );

                let status = 'PENDING';

                if (doneLog) {
                    status = 'DONE';
                } else if (now > scheduled) {
                    status = 'LATE';
                }

                result.push({
                    dependentId: r.dependentId,
                    routineId: r.id,
                    title: r.title,
                    type: r.type,
                    time,
                    status,
                    doneBy: doneLog?.doneBy || null,
                    doneAt: doneLog?.dateTime || null
                });
            });
        });
    });

    result.sort((a, b) => a.time.localeCompare(b.time));
    return result;
}

module.exports = { getTodayRoutines };
