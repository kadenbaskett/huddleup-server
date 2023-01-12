/*
  Warnings:

  - Added the required column `week` to the `Matchup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `matchup` ADD COLUMN `week` INTEGER NOT NULL;
