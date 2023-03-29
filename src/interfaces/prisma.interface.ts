
import { Transaction, TransactionPlayer, League, Team } from '@prisma/client';

export interface TransactionWithPlayers extends Transaction {
    players: TransactionPlayer[];
}

export interface LeagueInfo extends League {
    teams: Team[];
}