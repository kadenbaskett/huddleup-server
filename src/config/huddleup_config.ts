import { hoursToMilliseconds } from '@/services/general.service';

export const DRAFT = {
    DRAFT_BUFFER_TIME_FUTURE_MS: 1000 * 60 * 5, // nything five mins in future
    DRAFT_BUFFER_TIME_PAST_MS: 1000 * 60 * 20, // Anything twenty mins in past
    // DRAFT_BUFFER_TIME_PAST_MS: 1000 * 60 * 0, // No drafts that have started
    DRAFT_INTERVAL_TIME: 1000 * 5,
    START_PORT: 49152,
    TIME_BEFORE_DRAFT_START_MS: 1000 * 60,
    DRAFT_END_BUFFER_TIME_MS: 30 * 1000,
    PICK_DELAY_MS: 2 * 1000,
    AUTO_SECONDS_PER_PICK: 5,
    SECONDS_PER_PICK: 30,
    DRAFT_RESCHEDULE_TIME: 1000 * 600,
    TIME_FROM_CREATION_TO_START_DEFAULT_DAYS: 10,
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
        FILL_DRAFT: 'fillDraft', //this is when the user click "Fill Draft" from the front end
    },
};

export const DATA_SYNC = {
  TIMEFRAME: hoursToMilliseconds(1),
  TEAMS: hoursToMilliseconds(1),
  PLAYERS: hoursToMilliseconds(1),
  SCHEDULE: hoursToMilliseconds(1),
  GAMES_IN_PROGRESS: 60000, // Update once a minute
  NEWS: 180000, // Update every 3 minutes
  PROJECTIONS: 300000, // Update every 5 minutes
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

export const MIN_FANTASY_POINTS = 30;

export const SEASON = {
    START_WEEK: 1,
    FINAL_SEASON_WEEK: 14,
    NUM_PLAYOFF_TEAMS: 4,
    FINAL_PLAYOFF_WEEK: 17,
    WEEKS_PER_PLAYOFF_MATCHUP: 1,
    NFL_FINAL_WEEK: 18,
};

export const SETTINGS = {
    TRADE: {
        REVIEW_PERIOD_HOURS: 24,
        VOTES_TO_VETO: 1,
    },
};

export const SEED = {
    SEASON: 2022,
    NUM_PLAYOFF_TEAMS: 4,
    CURRENT_WEEK: 1,
    NUM_LEAGUES: 1,
    NUM_TEAMS: 10,
    USERS_PER_TEAM: 3,
    PPR: 'PPR',
    PUBLIC_JOIN: true,
    MIN_PLAYERS_PER_TEAM: 2,
    USERNAMES: [
      'talloryx0',
      'domesticrabbit1',
      'lovablequail2',
      'slimybadger3',
      'scalygoat4',
      'wildcassowary5',
      'fierceseahorse6',
      'herbivorouscobra7',
      'domesticsandpiper8',
      'hairywolverine9',
      'smallgoshawk10',
      'nosyrook11',
      'loudhedgehog12',
      'shortmarten13',
      'cleverguanaco14',
      'curiousbear15',
      'poisonousibex16',
      'feistytiger17',
      'carnivorouseel18',
      'colorfulcassowary19',
      'malicioussardine20',
      'scalyhornet21',
      'viciousspider22',
      'tenaciouseland23',
      'sassybear24',
      'smallmole25',
      'warmvulture26',
      'maternalhorse27',
      'heavymole28',
      'tinymoose29',
      'maternalheron0', 'largegazelle1', 'quickape2',
        'furrykingfisher3', 'wildmole4', 'poisonousleopard5',
        'poisonousgrasshopper6', 'territorialeel7', 'lazycurlew8',
        'cuterat9', 'clevercapybara10', 'poisonousllama11',
        'ferociousdolphin12', 'tamesalmon13', 'poisonousstarling14',
        'heavylouse15', 'coldcassowary16', 'hairychamois17',
        'strongquetzal18', 'tinygoldfish19', 'furrykangaroo20',
        'adorableraccoon21', 'softfalcon22', 'smallferret23',
        'friendlypelican24', 'quickfish25', 'furrywalrus26',
        'wildhedgehog27', 'smellyfrog28', 'hairyjay29',
        'smartdogfish30', 'energeticparrot31', 'dangerouscamel32',
        'softlion33', 'meanbison34', 'wildcassowary35',
        'cleverfrog36', 'smellyowl37', 'ferociousclam38',
        'clevershark39', 'smartpeafowl40', 'carnivorousspider41',
        'grumpyhedgehog42', 'agileyak43', 'herbivorousreddeer44',
        'nosywoodpecker45', 'candidjellyfish46', 'candideland47',
        'deadlyoctopus48', 'lovablenarwhal49', 'adorablelion50',
        'candidwhale51', 'herbivorouscoyote52', 'hairychimpanzee53',
        'wildbear54', 'colorfulmagpie55', 'smellyherring56',
        'stubbornshark57', 'stubbornpanther58', 'playfulgoldfish59',
        'smallemu60', 'carnivorouscrab61', 'wildchough62',
        'scalystinkbug63', 'cutegoat64', 'largedotterel65',
        'territorialpenguin66', 'shortelk67', 'fluffydinosaur68',
        'poisonoushornet69', 'furryaardvark70', 'smartantelope71',
        'softfalcon72', 'smallowl73', 'fuzzyrook74',
        'shortmagpie75', 'herbivorousflamingo76', 'coldbloodedemu77',
        'carnivorousdotterel78', 'tamemole79', 'territorialpig80',
        'tinyhare81', 'lovablejellyfish82', 'cuddlydugong83',
        'grumpyclam84', 'shorttermite85', 'fiercetarsier86',
        'messyrabbit87', 'wildwolf88', 'colorfulturkey89',
        'tamehippopotamus90', 'meankoala91', 'deadlyjaguar92',
        'ferociousviper93', 'candidstingray94', 'coldsardine95',
        'smartdinosaur96', 'tamestork97', 'scalycormorant98',
        'coldsanddollar99',
    ],
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

export const PROCESSES = {
    BACKEND: 'backend',
    WEBSOCKET: 'websocket',
    TASK_MANAGER: 'taskManager',
    DATASINK: 'datasink',
};

export const ENV = {
    DEV: 'development',
    PROD: 'production',
};
