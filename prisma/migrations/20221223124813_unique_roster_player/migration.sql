/*
  Warnings:

  - A unique constraint covering the columns `[player_id,roster_id]` on the table `RosterPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `RosterPlayer_player_id_roster_id_key` ON `RosterPlayer`(`player_id`, `roster_id`);
