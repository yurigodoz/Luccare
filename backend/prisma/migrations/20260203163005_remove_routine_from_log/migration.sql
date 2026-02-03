-- DropForeignKey
ALTER TABLE "RoutineLog" DROP CONSTRAINT "RoutineLog_routineId_fkey";

-- AlterTable
ALTER TABLE "RoutineLog" ALTER COLUMN "routineId" DROP NOT NULL,
ALTER COLUMN "dateTime" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
