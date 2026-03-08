-- CreateTable
CREATE TABLE "DependentDayTypeOffset" (
    "dependentId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "type" "RoutineType" NOT NULL,
    "offsetHours" INTEGER NOT NULL,
    "setBy" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DependentDayTypeOffset_pkey" PRIMARY KEY ("dependentId","date","type")
);

-- AddForeignKey
ALTER TABLE "DependentDayTypeOffset" ADD CONSTRAINT "DependentDayTypeOffset_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "Dependent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DependentDayTypeOffset" ADD CONSTRAINT "DependentDayTypeOffset_setBy_fkey" FOREIGN KEY ("setBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
