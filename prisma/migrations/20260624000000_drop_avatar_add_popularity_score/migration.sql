-- AlterTable: eliminar columna avatar (duplicada/no usada, ya no está en el schema)
ALTER TABLE "User" DROP COLUMN "avatar";

-- AlterTable: añadir popularityScore para precalcular el ranking de popularidad
ALTER TABLE "Game" ADD COLUMN "popularityScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex: acelerar el ORDER BY popularityScore filtrado por status=APPROVED
CREATE INDEX "Game_status_popularityScore_idx" ON "Game"("status", "popularityScore");