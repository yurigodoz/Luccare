-- CreateTable
CREATE TABLE "Routine" (
    "id" SERIAL NOT NULL,
    "dependentId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "times" TEXT[],
    "daysOfWeek" INTEGER[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineLog" (
    "id" SERIAL NOT NULL,
    "routineId" INTEGER NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "doneBy" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "RoutineLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "Dependent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
