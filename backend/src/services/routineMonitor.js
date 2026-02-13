const prisma = require('../database/prisma');

function startRoutineMonitor() {
    setInterval(async () => {
        const now = new Date();
        const day = now.getDay();
        const time = now.toTimeString().slice(0,5);

        const routines = await prisma.routine.findMany({
            where: {
                active: true,
                daysOfWeek: { some: { dayOfWeek: day } },
                times: { some: { time: time } }
            }
        });

        for (const r of routines) {
            console.log(`Rotina pendente agora: ${r.title} (Dependente ${r.dependentId})`);
        }
    }, 60 * 1000);
}

module.exports = { startRoutineMonitor };