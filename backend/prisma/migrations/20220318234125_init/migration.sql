-- CreateTable
CREATE TABLE "Planet" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "galaxy" INTEGER NOT NULL,
    "system" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "moon" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT NOT NULL,
    "userID" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Planet_galaxy_system_position_key" ON "Planet"("galaxy", "system", "position");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "Planet" ADD CONSTRAINT "Planet_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
