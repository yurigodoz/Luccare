-- DropForeignKey
ALTER TABLE "RoutineLog" DROP CONSTRAINT "RoutineLog_routineId_fkey";

-- DropForeignKey
ALTER TABLE "RoutineLog" DROP CONSTRAINT "RoutineLog_scheduleId_fkey";

-- DropIndex
DROP INDEX "RoutineDayOfWeek_dayOfWeek_idx";

-- AlterTable
ALTER TABLE "Routine" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "RoutineDayOfWeek_dayOfWeek_routineId_idx" ON "RoutineDayOfWeek"("dayOfWeek", "routineId");

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "RoutineSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
