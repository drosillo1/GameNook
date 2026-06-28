ALTER TABLE "User" DROP COLUMN "favoritePlatform";
ALTER TABLE "User" ADD COLUMN "favoritePlatforms" TEXT[] NOT NULL DEFAULT '{}';