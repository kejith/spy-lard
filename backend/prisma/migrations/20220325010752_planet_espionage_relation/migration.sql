-- AddForeignKey
ALTER TABLE "Espionage" ADD CONSTRAINT "Espionage_galaxy_system_position_fkey" FOREIGN KEY ("galaxy", "system", "position") REFERENCES "Planet"("galaxy", "system", "position") ON DELETE RESTRICT ON UPDATE CASCADE;
