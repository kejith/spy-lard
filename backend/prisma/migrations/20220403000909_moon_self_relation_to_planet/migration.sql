/*
  Warnings:

  - A unique constraint covering the columns `[moonID]` on the table `Planet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Planet_moonID_key" ON "Planet"("moonID");

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_moonID_fkey" FOREIGN KEY ("moonID") REFERENCES "Planet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
