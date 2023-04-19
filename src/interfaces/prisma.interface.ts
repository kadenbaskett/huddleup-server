
import { Transaction, TransactionPlayer, League, Team, LeagueSettings } from '@prisma/client';

export interface TransactionWithPlayers extends Transaction {
    players: TransactionPlayer[];
}

export interface LeagueInfo extends League {
    teams: Team[];
}

export interface LeagueWithTeamAndSettings extends League {
    teams: Team[];
    settings: LeagueSettings;
}