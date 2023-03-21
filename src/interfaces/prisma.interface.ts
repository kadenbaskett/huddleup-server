
import { Transaction, TransactionPlayer } from '@prisma/client';

export interface TransactionWithPlayers extends Transaction {
    players: TransactionPlayer[];
}