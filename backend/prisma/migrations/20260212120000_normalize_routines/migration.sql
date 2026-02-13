-- ============================================
-- 1. Criar novos enums
-- ============================================

CREATE TYPE "DependentRole" AS ENUM ('FAMILY', 'CAREGIVER', 'PROFESSIONAL');
CREATE TYPE "RoutineType" AS ENUM ('MEDICATION', 'FEEDING', 'THERAPY', 'HYGIENE', 'EXERCISE', 'OTHER');
CREATE TYPE "LogStatus" AS ENUM ('DONE', 'SKIPPED');

-- ============================================
-- 2. Criar tabelas normalizadas
-- ============================================

CREATE TABLE "RoutineTime" (
    "routineId" INTEGER NOT NULL,
    "time" TEXT NOT NULL,

    CONSTRAINT "RoutineTime_pkey" PRIMARY KEY ("routineId","time")
);

CREATE TABLE "RoutineDayOfWeek" (
    "routineId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,

    CONSTRAINT "RoutineDayOfWeek_pkey" PRIMARY KEY ("routineId","dayOfWeek")
);

-- ============================================
-- 3. Migrar dados dos arrays para as novas tabelas
-- ============================================

-- Migrar times (String[]) para RoutineTime
INSERT INTO "RoutineTime" ("routineId", "time")
SELECT "id", unnest("times")
FROM "Routine"
WHERE array_length("times", 1) > 0
ON CONFLICT DO NOTHING;

-- Migrar daysOfWeek (Int[]) para RoutineDayOfWeek
INSERT INTO "RoutineDayOfWeek" ("routineId", "dayOfWeek")
SELECT "id", unnest("daysOfWeek")
FROM "Routine"
WHERE array_length("daysOfWeek", 1) > 0
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. Remover colunas de array da Routine
-- ============================================

ALTER TABLE "Routine" DROP COLUMN "times";
ALTER TABLE "Routine" DROP COLUMN "daysOfWeek";

-- ============================================
-- 5. Adicionar updatedAt à Routine (com default para registros existentes)
-- ============================================

ALTER TABLE "Routine" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- 6. Converter Routine.type de String para RoutineType enum
-- ============================================

ALTER TABLE "Routine" ALTER COLUMN "type" TYPE "RoutineType" USING "type"::"RoutineType";

-- ============================================
-- 7. Converter DependentUser.role de String para DependentRole enum
--    Renomear PARENT → FAMILY
-- ============================================

UPDATE "DependentUser" SET "role" = 'FAMILY' WHERE "role" = 'PARENT';
ALTER TABLE "DependentUser" ALTER COLUMN "role" TYPE "DependentRole" USING "role"::"DependentRole";

-- ============================================
-- 8. RoutineSchedule: remover status e converter scheduledDate para DATE
-- ============================================

ALTER TABLE "RoutineSchedule" DROP COLUMN "status";
ALTER TABLE "RoutineSchedule" ALTER COLUMN "scheduledDate" SET DATA TYPE DATE;

DROP TYPE "ScheduleStatus";

-- ============================================
-- 9. RoutineLog: tornar scheduleId e routineId obrigatórios,
--    converter status para LogStatus enum
-- ============================================

-- Preencher routineId nos logs que não têm (buscar via schedule)
UPDATE "RoutineLog" l
SET "routineId" = s."routineId"
FROM "RoutineSchedule" s
WHERE l."scheduleId" = s."id"
  AND l."routineId" IS NULL;

-- Remover logs órfãos (sem scheduleId nem routineId) se houver
DELETE FROM "RoutineLog" WHERE "scheduleId" IS NULL;
DELETE FROM "RoutineLog" WHERE "routineId" IS NULL;

-- Tornar campos obrigatórios
ALTER TABLE "RoutineLog" ALTER COLUMN "scheduleId" SET NOT NULL;
ALTER TABLE "RoutineLog" ALTER COLUMN "routineId" SET NOT NULL;

-- Converter status para enum
ALTER TABLE "RoutineLog" ALTER COLUMN "status" TYPE "LogStatus" USING "status"::"LogStatus";

-- ============================================
-- 10. Foreign keys das novas tabelas
-- ============================================

ALTER TABLE "RoutineTime" ADD CONSTRAINT "RoutineTime_routineId_fkey"
    FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoutineDayOfWeek" ADD CONSTRAINT "RoutineDayOfWeek_routineId_fkey"
    FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 11. Índices
-- ============================================

CREATE INDEX "Routine_dependentId_active_idx" ON "Routine"("dependentId", "active");
CREATE INDEX "RoutineDayOfWeek_dayOfWeek_idx" ON "RoutineDayOfWeek"("dayOfWeek");
