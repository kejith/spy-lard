/*
  Warnings:

  - You are about to drop the column `moon` on the `Planet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Planet" 
RENAME COLUMN "moon" TO "hasMoon";


ALTER TABLE "Planet" 
ADD COLUMN "moonID" INTEGER;
