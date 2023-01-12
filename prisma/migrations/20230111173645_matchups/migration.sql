-- CreateTable
CREATE TABLE `Matchup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `league_id` INTEGER NOT NULL,
    `home_team_id` INTEGER NOT NULL,
    `away_team_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Matchup` ADD CONSTRAINT `Matchup_league_id_fkey` FOREIGN KEY (`league_id`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matchup` ADD CONSTRAINT `Matchup_home_team_id_fkey` FOREIGN KEY (`home_team_id`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Matchup` ADD CONSTRAINT `Matchup_away_team_id_fkey` FOREIGN KEY (`away_team_id`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
