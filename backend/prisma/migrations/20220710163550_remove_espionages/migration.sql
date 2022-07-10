/*
  Warnings:

  - You are about to drop the `Espionage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Espionage" DROP CONSTRAINT "Espionage_galaxy_system_position_planetType_fkey";

-- DropTable
DROP TABLE "Espionage";
