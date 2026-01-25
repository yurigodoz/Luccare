-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dependent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DependentUser" (
    "userId" INTEGER NOT NULL,
    "dependentId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "DependentUser_pkey" PRIMARY KEY ("userId","dependentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "DependentUser" ADD CONSTRAINT "DependentUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DependentUser" ADD CONSTRAINT "DependentUser_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "Dependent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
