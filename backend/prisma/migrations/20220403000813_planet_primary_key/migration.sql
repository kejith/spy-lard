-- AlterTable
ALTER TABLE "Planet" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Planet_pkey" PRIMARY KEY ("id");
