-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'DONE', 'SKIPPED', 'CANCELED');

-- CreateTable
CREATE TABLE "RoutineSchedule" (
    "id" SERIAL NOT NULL,
    "routineId" INTEGER NOT NULL,
    "dependentId" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TEXT NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoutineSchedule_dependentId_scheduledDate_scheduledTime_rou_key" ON "RoutineSchedule"("dependentId", "scheduledDate", "scheduledTime", "routineId");

-- AddForeignKey
ALTER TABLE "RoutineSchedule" ADD CONSTRAINT "RoutineSchedule_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineSchedule" ADD CONSTRAINT "RoutineSchedule_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "Dependent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
