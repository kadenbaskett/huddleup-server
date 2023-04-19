
export const DRAFT = {
    DRAFT_BUFFER_TIME_FUTURE_MS: 1000 * 60 * 5, // nything five mins in future
    DRAFT_BUFFER_TIME_PAST_MS: 1000 * 60 * 20, // Anything five mins in past
    // DRAFT_BUFFER_TIME_PAST_MS: 1000 * 60 * 0, // No drafts that have started
    DRAFT_INTERVAL_TIME: 1000 * 5,
    START_PORT: 49152,
    TIME_BEFORE_DRAFT_START_MS: 1000 * 20,
    DRAFT_END_BUFFER_TIME_MS: 30 * 1000,
    PICK_DELAY_MS: 2 * 1000,
    AUTO_SECONDS_PER_PICK: 5,
    SECONDS_PER_PICK: 30,
    DRAFT_RESCHEDULE_TIME: 1000 * 600,
    MSG_TYPES: {
        PING: 'ping',
        INITIAL_CONNECTION: 'initialConnectionGetDraftState',
        DRAFT_UPDATE: 'draftUpdate',
        QUEUE_PLAYER: 'queuePlayer',
        REMOVE_QUEUE_PLAYER: 'removeQueuePlayer',
        RE_ORDER_QUEUE_PLAYER: 'removeQueuePlayer',
        DRAFT_PLAYER: 'draftPlayer',
        ERROR: 'error',
        END_DRAFT: 'endDraft',
    },
};

export const TRANSACTION_TYPES = {
    TRADE: 'Trade',
    ADD: 'Add',
    DROP: 'Drop',
    ADD_DROP: 'AddDrop',
};

export const TRANSACTION_STATUS = {
    REJECTED: 'Rejected',
    COMPLETE: 'Complete',
    SENT: 'SentToRelatedTeam',
    PENDING: 'Pending',
};


export const TRANSACTION_ACTIONS = {
    REJECT: 'Reject',
    APPROVE: 'Approve',
};

export const POSITIONS = {
    BENCH: 'BE',
    QUARTERBACK: 'QB',
    RUNNING_BACK: 'RB',
    WIDE_RECIEVER: 'WR',
    TIGHT_END: 'TE',
    FLEX: 'FLEX',
};

export const ROSTER_START_CONSTRAINTS = {
    QB: 1,
    RB: 2,
    WR: 2,
    TE: 1,
    FLEX: 1,
    TOTAL: 15,
};

export const FANTASY_POSITIONS = [ 'RB', 'WR', 'TE', 'QB' ];

export const FLEX_POSITIONS = [ 'RB', 'WR', 'TE' ];

export const SEASON = {
    NUM_PLAYOFF_TEAMS: 4,
    FINAL_PLAYOFF_WEEK: 17,
};

export const SEED = {

};

export const SCORING = {
    INT_THROWN: -2,
    FUMBLES: -2,
    PASS_TD: 4,
    PASS_YARDS: 0.25,
    REC_YARDS: 0.1,
    REC_TD: 6,
    PPR_RECEPTIONS: 1,
    HALF_PPR_RECEPTIONS: 0.5,
    NO_PPR_RECEPTIONS: 0,
    RUSH_YARDS: 0.1,
    RUSH_TD: 6,
    TWO_PNT_CONV_PASS: 2,
    TWO_PNT_CONV_REC: 2,
    TWO_PNT_CONV_RUN: 2,
};
