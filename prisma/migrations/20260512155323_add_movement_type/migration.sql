-- CreateEnum
CREATE TYPE "Behavior" AS ENUM ('entrada', 'saida', 'encomenda');

-- CreateTable
CREATE TABLE "MovementType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "behavior" "Behavior" NOT NULL,
    "storeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovementType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovementType_name_storeId_key" ON "MovementType"("name", "storeId");

-- AddForeignKey
ALTER TABLE "MovementType" ADD CONSTRAINT "MovementType_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
