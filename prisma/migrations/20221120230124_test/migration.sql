-- CreateTable
CREATE TABLE `League` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commissioner` INTEGER NOT NULL,
    `leagueSettingsId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeagueSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numTeams` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(191) NOT NULL,
    `publicJoin` BOOLEAN NOT NULL,
    `publicView` BOOLEAN NOT NULL,
    `draftSettingsId` INTEGER NOT NULL,
    `rosterSettingsId` INTEGER NOT NULL,
    `scoringSettingsId` INTEGER NOT NULL,
    `waiverSettingsId` INTEGER NOT NULL,
    `tradeSettingsId` INTEGER NOT NULL,
    `scheduleSettingsId` INTEGER NOT NULL,

    UNIQUE INDEX `LeagueSettings_draftSettingsId_key`(`draftSettingsId`),
    UNIQUE INDEX `LeagueSettings_rosterSettingsId_key`(`rosterSettingsId`),
    UNIQUE INDEX `LeagueSettings_scoringSettingsId_key`(`scoringSettingsId`),
    UNIQUE INDEX `LeagueSettings_waiverSettingsId_key`(`waiverSettingsId`),
    UNIQUE INDEX `LeagueSettings_tradeSettingsId_key`(`tradeSettingsId`),
    UNIQUE INDEX `LeagueSettings_scheduleSettingsId_key`(`scheduleSettingsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RosterSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numQB` INTEGER NOT NULL,
    `numRB` INTEGER NOT NULL,
    `numWR` INTEGER NOT NULL,
    `numTE` INTEGER NOT NULL,
    `numFlex` INTEGER NOT NULL,
    `numDEF` INTEGER NOT NULL,
    `numKicker` INTEGER NOT NULL,
    `numIR` INTEGER NOT NULL,
    `benchSpots` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScoringSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `passYardPoints` DOUBLE NOT NULL,
    `passTouchdownPoints` DOUBLE NOT NULL,
    `interceptionThrownPoints` DOUBLE NOT NULL,
    `twoPointConversionPassPoints` DOUBLE NOT NULL,
    `rushYardPoints` DOUBLE NOT NULL,
    `rushTouchdownPoints` DOUBLE NOT NULL,
    `twoPointConversionRushPoints` DOUBLE NOT NULL,
    `recYardPoints` DOUBLE NOT NULL,
    `recTouchdownPoints` DOUBLE NOT NULL,
    `pointsPerReception` DOUBLE NOT NULL,
    `twoPointConversionReceivePoints` DOUBLE NOT NULL,
    `patMadePoints` DOUBLE NOT NULL,
    `patMissedPoints` DOUBLE NOT NULL,
    `fieldGoalPointsPerYard` DOUBLE NOT NULL,
    `fumbleLostPoints` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WaiverSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lineupLockTime` INTEGER NOT NULL,
    `aquisitionLimit` INTEGER NOT NULL,
    `waiverPeriodHours` INTEGER NOT NULL,
    `waiverOrder` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TradeSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seasonTradeLimit` INTEGER NOT NULL,
    `tradeDeadline` DATETIME(3) NOT NULL,
    `tradeReviewPeriodHours` INTEGER NOT NULL,
    `votesToVetoTrade` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seasonStartWeek` INTEGER NOT NULL,
    `seasonEndWeek` INTEGER NOT NULL,
    `playoffStartWeek` INTEGER NOT NULL,
    `playoffEndWeek` INTEGER NOT NULL,
    `numTeamsInPlayoffs` INTEGER NOT NULL,
    `weeksPerPlayoffMatchup` INTEGER NOT NULL,
    `playoffSeedTiebreaker` INTEGER NOT NULL,
    `playoffHomefieldAdvantagePoints` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DraftSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `orderGeneration` INTEGER NOT NULL,
    `secondsPerPick` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numTransactions` INTEGER NOT NULL,
    `numTrades` INTEGER NOT NULL,
    `playerWatchList` INTEGER NOT NULL,
    `leagueId` INTEGER NOT NULL,
    `teamSettingsId` INTEGER NOT NULL,

    UNIQUE INDEX `Team_teamSettingsId_key`(`teamSettingsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Matchup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `week` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `abbreviation` VARCHAR(191) NOT NULL,
    `usesVoting` BOOLEAN NOT NULL,
    `hasTeamCaptain` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Roster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teamId` INTEGER NOT NULL,
    `week` INTEGER NOT NULL,
    `season` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RosterPlayer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NOT NULL,
    `rosterPosition` INTEGER NOT NULL,
    `rosterId` INTEGER NULL,
    `tradeId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `submissionDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AddPlayer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NOT NULL,
    `rosterPosition` INTEGER NOT NULL,
    `transactionId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DropPlayer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NOT NULL,
    `rosterPosition` INTEGER NOT NULL,
    `transactionId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trade` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_MatchupToTeam` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_MatchupToTeam_AB_unique`(`A`, `B`),
    INDEX `_MatchupToTeam_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `League` ADD CONSTRAINT `League_leagueSettingsId_fkey` FOREIGN KEY (`leagueSettingsId`) REFERENCES `LeagueSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeagueSettings` ADD CONSTRAINT `LeagueSettings_draftSettingsId_fkey` FOREIGN KEY (`draftSettingsId`) REFERENCES `DraftSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeagueSettings` ADD CONSTRAINT `LeagueSettings_rosterSettingsId_fkey` FOREIGN KEY (`rosterSettingsId`) REFERENCES `RosterSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeagueSettings` ADD CONSTRAINT `LeagueSettings_scoringSettingsId_fkey` FOREIGN KEY (`scoringSettingsId`) REFERENCES `ScoringSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeagueSettings` ADD CONSTRAINT `LeagueSettings_waiverSettingsId_fkey` FOREIGN KEY (`waiverSettingsId`) REFERENCES `WaiverSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeagueSettings` ADD CONSTRAINT `LeagueSettings_tradeSettingsId_fkey` FOREIGN KEY (`tradeSettingsId`) REFERENCES `TradeSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeagueSettings` ADD CONSTRAINT `LeagueSettings_scheduleSettingsId_fkey` FOREIGN KEY (`scheduleSettingsId`) REFERENCES `ScheduleSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_leagueId_fkey` FOREIGN KEY (`leagueId`) REFERENCES `League`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_teamSettingsId_fkey` FOREIGN KEY (`teamSettingsId`) REFERENCES `TeamSettings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Roster` ADD CONSTRAINT `Roster_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RosterPlayer` ADD CONSTRAINT `RosterPlayer_rosterId_fkey` FOREIGN KEY (`rosterId`) REFERENCES `Roster`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RosterPlayer` ADD CONSTRAINT `RosterPlayer_tradeId_fkey` FOREIGN KEY (`tradeId`) REFERENCES `Trade`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AddPlayer` ADD CONSTRAINT `AddPlayer_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DropPlayer` ADD CONSTRAINT `DropPlayer_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transaction`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MatchupToTeam` ADD CONSTRAINT `_MatchupToTeam_A_fkey` FOREIGN KEY (`A`) REFERENCES `Matchup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_MatchupToTeam` ADD CONSTRAINT `_MatchupToTeam_B_fkey` FOREIGN KEY (`B`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
