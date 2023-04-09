
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