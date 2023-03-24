/*
  Warnings:

  - A unique constraint covering the columns `[pick_number,team_id]` on the table `DraftOrder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[away_team_id,home_team_id]` on the table `Matchup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[season,week,team_id]` on the table `Roster` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,team_id]` on the table `UserToTeam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `DraftPlayer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `league_id` INTEGER NOT NULL,
    `player_id` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL,
    `pick_number` INTEGER NOT NULL,

    UNIQUE INDEX `DraftPlayer_league_id_player_id_key`(`league_id`, `player_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DraftQueue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `league_id` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL,
    `player_id` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,

    UNIQUE INDEX `DraftQueue_team_id_key`(`team_id`),
    UNIQUE INDEX `DraftQueue_order_key`(`order`),
    UNIQUE INDEX `DraftQueue_team_id_player_id_key`(`team_id`, `player_id`),
    UNIQUE INDEX `DraftQueue_team_id_order_key`(`team_id`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `DraftOrder_pick_number_team_id_key` ON `DraftOrder`(`pick_number`, `team_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Matchup_away_team_id_home_team_id_key` ON `Matchup`(`away_team_id`, `home_team_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Roster_season_week_team_id_key` ON `Roster`(`season`, `week`, `team_id`);

-- CreateIndex
CREATE UNIQUE INDEX `UserToTeam_user_id_team_id_key` ON `UserToTeam`(`user_id`, `team_id`);

-- AddForeignKey
ALTER TABLE `DraftPlayer` ADD CONSTRAINT `DraftPlayer_league_id_fkey` FOREIGN KEY (`league_id`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftPlayer` ADD CONSTRAINT `DraftPlayer_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftPlayer` ADD CONSTRAINT `DraftPlayer_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftQueue` ADD CONSTRAINT `DraftQueue_league_id_fkey` FOREIGN KEY (`league_id`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftQueue` ADD CONSTRAINT `DraftQueue_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DraftQueue` ADD CONSTRAINT `DraftQueue_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `Player`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
