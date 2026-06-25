-- AlterTable: eliminar descriptionModified (ya no se permite editar la descripción de IGDB)
ALTER TABLE "Game" DROP COLUMN IF EXISTS "descriptionModified";