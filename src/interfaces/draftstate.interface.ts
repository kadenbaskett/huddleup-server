import { DraftPlayer, DraftQueue } from '@prisma/client';

export interface DraftState {
    draftPlayers: DraftPlayer[],
    draftQueue: DraftQueue[],
}