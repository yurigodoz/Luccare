-- AlterTable: Remove id and routineId from RoutineLog, make scheduleId the primary key

-- Drop foreign key for routineId
ALTER TABLE "RoutineLog" DROP CONSTRAINT IF EXISTS "RoutineLog_routineId_fkey";

-- Drop the old primary key (id)
ALTER TABLE "RoutineLog" DROP CONSTRAINT "RoutineLog_pkey";

-- Drop the unique constraint on scheduleId (will become PK)
ALTER TABLE "RoutineLog" DROP CONSTRAINT IF EXISTS "RoutineLog_scheduleId_key";

-- Drop columns
ALTER TABLE "RoutineLog" DROP COLUMN "id";
ALTER TABLE "RoutineLog" DROP COLUMN "routineId";

-- Add scheduleId as primary key
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_pkey" PRIMARY KEY ("scheduleId");
