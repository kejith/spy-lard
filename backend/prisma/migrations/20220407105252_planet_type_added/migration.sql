/*
  Warnings:

  - A unique constraint covering the columns `[galaxy,system,position,planetType]` on the table `Planet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Espionage" DROP CONSTRAINT "Espionage_galaxy_system_position_fkey";

-- DropIndex
DROP INDEX "Planet_galaxy_system_position_key";

-- AlterTable
ALTER TABLE "Planet" ADD COLUMN     "planetType" TEXT NOT NULL DEFAULT E'planet';

-- CreateIndex
CREATE UNIQUE INDEX "Planet_galaxy_system_position_planetType_key" ON "Planet"("galaxy", "system", "position", "planetType");

-- AddForeignKey
ALTER TABLE "Espionage" ADD CONSTRAINT "Espionage_galaxy_system_position_planetType_fkey" FOREIGN KEY ("galaxy", "system", "position", "planetType") REFERENCES "Planet"("galaxy", "system", "position", "planetType") ON DELETE RESTRICT ON UPDATE CASCADE;
