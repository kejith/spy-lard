/*
  Warnings:

  - You are about to drop the column `alliance` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "alliance",
ADD COLUMN     "allianceID" INTEGER;

-- CreateTable
CREATE TABLE "Alliance" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Alliance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_allianceID_fkey" FOREIGN KEY ("allianceID") REFERENCES "Alliance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
