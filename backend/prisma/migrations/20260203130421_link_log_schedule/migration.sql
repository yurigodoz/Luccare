-- AlterTable
ALTER TABLE "RoutineLog" ADD COLUMN     "scheduleId" INTEGER;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "RoutineSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
