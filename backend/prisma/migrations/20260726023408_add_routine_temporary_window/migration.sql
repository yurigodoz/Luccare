-- AlterTable
ALTER TABLE "Routine" ADD COLUMN     "endDate" DATE,
ADD COLUMN     "isTemporary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" DATE;
