/*
  Warnings:

  - A unique constraint covering the columns `[scheduleId]` on the table `RoutineLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RoutineLog_scheduleId_key" ON "RoutineLog"("scheduleId");
