/*
  Warnings:

  - Added the required column `max_players` to the `LeagueSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_players` to the `LeagueSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `leaguesettings` ADD COLUMN `max_players` INTEGER NOT NULL,
    ADD COLUMN `min_players` INTEGER NOT NULL;
