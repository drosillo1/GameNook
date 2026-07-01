-- =============================================================
-- Migración: nuevos campos IGDB + wishlist + recomendaciones
-- Ejecutar en Supabase SQL Editor (local Y producción)
-- =============================================================

-- 1. Nuevos campos en Game (datos enriquecidos de IGDB)
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "themes" TEXT[] DEFAULT '{}';
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "playerPerspectives" TEXT[] DEFAULT '{}';
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "multiplayerInfo" JSONB;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "ageRatings" JSONB;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "languageSupports" JSONB;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "gameEngine" TEXT;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "websites" JSONB;
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "youtubeVideoIds" TEXT[] DEFAULT '{}';
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "dlcIgdbIds" INTEGER[] DEFAULT '{}';

-- 2. Campo para recomendaciones híbridas
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "similarGameIgdbIds" INTEGER[] DEFAULT '{}';

-- 3. Campo para upcoming
ALTER TABLE "Game" ADD COLUMN IF NOT EXISTS "releaseStatus" INTEGER;

-- 4. Nuevo valor WISHLIST en CollectionStatus
ALTER TYPE "CollectionStatus" ADD VALUE IF NOT EXISTS 'WISHLIST';