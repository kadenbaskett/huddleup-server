import { DraftPlayer, DraftQueue } from '@prisma/client';

export interface DraftOrder {
    teamId: number,
    pick: number,
}

export interface AutoDraft {
    teamId: number,
    auto: boolean,
}

export interface DraftState {
    draftPlayers: DraftPlayer[],
    draftQueue: DraftQueue[],
    draftOrder: DraftOrder[],
    autoDraft: AutoDraft[],
    currentPickTeamId: number,
    currentPickNum: number,
    currentRoundNum: number,
    currentPickTimeMS: number,
    draftStartTimeMS: number,
}
