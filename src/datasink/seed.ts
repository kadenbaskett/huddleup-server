/* eslint-disable @typescript-eslint/no-var-requires */
import {
  DraftSettings,
  LeagueSettings,
  PrismaClient,
  RosterSettings,
  ScheduleSettings,
  ScoringSettings,
  TradeSettings,
  WaiverSettings,
} from '@prisma/client';
// import { createAccount } from '../firebase/firebase';
import { calculateSeasonLength, createMatchups } from './services/helpers.service';
import randomstring from 'randomstring';
import DatabaseService from './services/database.service';
/*
 *  Seeds the database with mock data. The simulate league function will
 *  create new users, leagues, teams, rosters, and roster players
 */
class Seed {
  client: PrismaClient;
  db: DatabaseService;

  constructor() {
    this.client = new PrismaClient();
    this.db = new DatabaseService();
  }

  async createEmptyLeague() {
    const leagueSettings = await this.createLeagueSettings(8, true, 2, 2, 'PPR');
    await this.createLeague('fake name', 'fake description', 1, leagueSettings.id);
  }

  async fillLeague(leagueId: number) {
    const league = await this.client.league.findFirst({
      where: { id: leagueId },
      include: {
        settings: true,
        teams: {
          include: {
            managers: true,
          },
        },
      },
    });
    let users = await this.createFirebaseUsers();
    // remove users who are on teams from users to be added to league
    league.teams.forEach((team) => {
      team.managers.forEach((manager) => {
        users = users.filter((user) => user.id !== manager.id);
      });
    });
    // add managers to unfinished teams
    league.teams.map(async (team) => {
      let numManagers = team.managers.length;
      while (numManagers < league.settings.min_players) {
        // add user to team
        await this.client.userToTeam.create({
          data: { team_id: team.id, user_id: users[0].id, is_captain: false },
        });
        numManagers++;
        users.shift();
      }
    });
    // add remaining teams
    const neededTeams = league.settings.num_teams - league.teams.length;
    const teamNames = this.generateTeamNames(neededTeams);
    await this.createTeams(league, users, teamNames);
  }

  async simulateDraft(leagueId: number) {
    const teams = await this.client.team.findMany({ where: { league_id: leagueId } });
    await this.simulateTimeframe(1);
    await this.buildRandomRostersSamePlayersEveryWeek(1, 2022, teams);
  }

  async simulateMatchups(leagueId: number) {
    const teams = await this.client.team.findMany({ where: { league_id: leagueId } });
    const seasonLength = calculateSeasonLength(4);
    const matchups = await createMatchups(teams, seasonLength);
    for (const matchup of matchups) {
      await this.client.matchup.create({
        data: {
          ...matchup,
          league_id: leagueId,
        },
      });
    }
  }

  async simulateTimeframe(week: number) {
    const timeframes = await this.client.timeframe.findMany();
    timeframes.forEach(async (tf) => {
      if (Number(tf.season) > 2021 && Number(tf.week) > week && Number(tf.type) === 1) {
        tf.has_ended = false;
        tf.has_started = false;
      } else if (Number(tf.season) > 2021 && Number(tf.week) === week && Number(tf.type) === 1) {
        tf.has_ended = false;
        tf.has_started = true;
      } else if (Number(tf.season) > 2021 && Number(tf.week) < week && Number(tf.type) === 1) {
        tf.has_ended = true;
        tf.has_started = true;
      }
      await this.client.timeframe.update({ where: { id: tf.id }, data: tf });
    });
  }

  async simulateWeek(leagueId: number, week: number) {
    const previousTimeframe = await this.db.getTimeframe();
    const rosters = await this.client.roster.findMany({
      where: {
        week: previousTimeframe.week,
        team: {
          league_id: leagueId,
        },
      },
      include: {
        players: true,
      },
    });

    await this.simulateTimeframe(week);

    rosters.forEach(async (roster) => {
      for (let i = previousTimeframe.week; i <= week; i++) {
        await this.copyRoster(i, roster);
      }
    });
  }

  async seedDB() {
    await this.clearLeagueStuff();

    const season = 2022;
    const numPlayoffTeams = 4;
    const currentWeek = 6;
    const numLeagues = 4;
    const numTeams = 10;
    const usersPerTeam = 3;
    const numUsers = usersPerTeam * numTeams;
    const users = await this.createFirebaseUsers();
    const leagueNames = this.generateLeagueNames(numLeagues);

    for (let i = 0; i < leagueNames.length; i++) {
      const commish = users[Math.floor(Math.random() * users.length)];
      await this.simulateLeague(
        users,
        leagueNames[i],
        commish,
        numTeams,
        season,
        currentWeek,
        numPlayoffTeams,
        numUsers,
      );
    }
  }

  async clearLeagueStuff() {
    // The order that the tables are cleared in is important
    // We can't clear a table that is referenced by another table using a foreign key without first clearing
    // the table that references it
    await this.client.transactionPlayer.deleteMany();
    await this.client.transactionAction.deleteMany();
    await this.client.transaction.deleteMany();
    await this.client.rosterPlayer.deleteMany();
    await this.client.roster.deleteMany();
    await this.client.userToTeam.deleteMany();
    await this.client.matchup.deleteMany();
    await this.client.team.deleteMany();
    await this.client.teamSettings.deleteMany();
    await this.client.league.deleteMany();
    await this.client.leagueSettings.deleteMany();
    await this.client.draftSettings.deleteMany();
    await this.client.rosterSettings.deleteMany();
    await this.client.tradeSettings.deleteMany();
    await this.client.scoringSettings.deleteMany();
    await this.client.scheduleSettings.deleteMany();
    await this.client.waiverSettings.deleteMany();
    await this.client.user.deleteMany();

    console.log('Cleared db successfully of old league data');
  }

  async simulateLeague(
    users,
    name,
    commish,
    numTeams,
    season,
    currentWeek,
    numPlayoffTeams,
    numUsers,
  ) {
    const teamNames = this.generateTeamNames(numTeams);
    const description = `example description for ${name}`;

    const leagueSettings = await this.createLeagueSettings(numTeams, true, 2, numUsers, 'PPR');
    const league = await this.createLeague(name, description, commish.id, leagueSettings.id);
    const teams = await this.createTeams(league, users, teamNames);

    await this.buildRandomRostersSamePlayersEveryWeek(currentWeek, season, teams);

    await this.simulateTransactions(league, currentWeek);

    const regSeasonLen = calculateSeasonLength(numPlayoffTeams);
    const matchups = createMatchups(teams, regSeasonLen);

    for (const matchup of matchups) {
      await this.client.matchup.create({
        data: {
          ...matchup,
          league_id: league.id,
        },
      });
    }
  }

  async simulateTransactions(league, currentWeek) {
    const trades = [
      {
        pos: 'QB',
        week: 2,
        status: 'Complete',
      },
      {
        pos: 'TE',
        week: 3,
        status: 'Complete',
      },
      {
        pos: 'RB',
        week: 5,
        status: 'Rejected',
      },
      {
        pos: 'WR',
        week: 6,
        status: 'Pending',
      },
    ];

    for (const trade of trades) {
      const rosters = await this.client.roster.findMany({
        where: {
          week: trade.week,
          team: {
            league_id: league.id,
          },
        },
        include: {
          players: true,
        },
      });

      const teamOneRoster = rosters.at(0);
      const teamTwoRoster = rosters.at(1);

      const teamOne = await this.client.team.findUnique({
        where: {
          id: teamOneRoster.team_id,
        },
        include: {
          managers: {
            include: {
              user: true,
            },
          },
        },
      });

      await this.simulateTrade(
        teamOneRoster,
        teamTwoRoster,
        currentWeek,
        trade.pos,
        trade.week,
        trade.status,
        teamOne.managers[0].user_id,
        teamOne.managers[1].user_id,
      );
    }
  }

  async simulateTrade(
    teamOneRoster,
    teamTwoRoster,
    currentWeek,
    pos,
    weekTradeCreated,
    tradeStatus,
    proposingUserId,
    approvingUserId,
  ) {
    const rosterPlayerOne = teamOneRoster.players.find((p) => p.position === pos);
    const rosterPlayerTwo = teamTwoRoster.players.find((p) => p.position === pos);

    const creation = new Date();
    const execution = new Date();
    const expiration = new Date();

    const diff = currentWeek - weekTradeCreated;
    const daysAgo = diff * 7;

    creation.setDate(creation.getDate() - daysAgo);
    execution.setDate(execution.getDate() - daysAgo + 1);
    expiration.setDate(expiration.getDate() - daysAgo + 3);

    const created = await this.client.transaction.create({
      data: {
        type: 'Trade',
        status: tradeStatus,
        creation_date: creation,
        expiration_date: expiration,
        execution_date: execution,
        week: weekTradeCreated,
        proposing_team_id: teamOneRoster.team_id,
        related_team_id: teamTwoRoster.team_id,
        user_id: proposingUserId,
      },
    });

    if (tradeStatus == 'Rejected' || tradeStatus == 'Complete') {
      await this.client.transactionAction.create({
        data: {
          transaction_id: created.id,
          user_id: approvingUserId,
          action_date: creation,
          action_type: tradeStatus == 'Rejected' ? 'Reject' : 'Approve',
        },
      });
    }

    await this.client.transactionPlayer.create({
      data: {
        transaction_id: created.id,
        player_id: rosterPlayerOne.player_id,
        joins_proposing_team: false,
      },
    });

    await this.client.transactionPlayer.create({
      data: {
        transaction_id: created.id,
        player_id: rosterPlayerTwo.player_id,
        joins_proposing_team: true,
      },
    });

    if (tradeStatus === 'Complete') {
      await this.updateRostersPostTrade(
        teamOneRoster,
        teamTwoRoster,
        rosterPlayerOne,
        rosterPlayerTwo,
      );
    }
  }

  // Updates all rosters going forward with the new traded players
  async updateRostersPostTrade(rosterOne, rosterTwo, rosterPlayerOne, rosterPlayerTwo) {
    const teamOneRosters = await this.client.roster.findMany({
      where: {
        team_id: rosterOne.team_id,
        week: {
          gte: rosterOne.week,
        },
      },
    });

    for (const r of teamOneRosters) {
      // delete player one from roster one
      await this.client.rosterPlayer.delete({
        where: {
          player_id_roster_id: {
            roster_id: r.id,
            player_id: rosterPlayerOne.player_id,
          },
        },
      });

      // add player two to roster one
      await this.client.rosterPlayer.create({
        data: {
          external_id: rosterPlayerTwo.external_id,
          position: rosterPlayerTwo.position,
          roster_id: r.id,
          player_id: rosterPlayerTwo.player_id,
        },
      });
    }

    const teamTwoRosters = await this.client.roster.findMany({
      where: {
        team_id: rosterTwo.team_id,
        week: {
          gte: rosterTwo.week,
        },
      },
    });

    for (const r of teamTwoRosters) {
      // delete player one from roster one
      await this.client.rosterPlayer.delete({
        where: {
          player_id_roster_id: {
            roster_id: r.id,
            player_id: rosterPlayerTwo.player_id,
          },
        },
      });

      // add player two to roster one
      await this.client.rosterPlayer.create({
        data: {
          external_id: rosterPlayerOne.external_id,
          position: rosterPlayerOne.position,
          roster_id: r.id,
          player_id: rosterPlayerOne.player_id,
        },
      });
    }
  }

  async buildRandomRostersSamePlayersEveryWeek(weeks, season, teams) {
    let playerIdsUsed = [];
    const rosters = [];
    for (const team of teams) {
      const roster = await this.buildRandomRoster(1, team.id, season, playerIdsUsed);

      if (roster.players) {
        const rosterPlayerIds = roster.players.map((p) => p.external_id);
        playerIdsUsed = playerIdsUsed.concat(rosterPlayerIds);
      }

      rosters.push(roster);
    }

    for (let week = 2; week <= weeks; week++) {
      for (const r of rosters) {
        await this.copyRoster(week, r);
      }
    }
  }

  async buildRandomRosterNewPlayersEveryWeek(weeks, season, teams) {
    for (let week = 1; week <= weeks; week++) {
      let playerIdsUsed = [];
      let weekRosters = [];

      for (const team of teams) {
        const roster = await this.buildRandomRoster(week, team.id, season, playerIdsUsed);
        if (roster.players) {
          const rosterPlayerIds = roster.players.map((p) => p.external_id);
          playerIdsUsed = playerIdsUsed.concat(rosterPlayerIds);
        }

        weekRosters = weekRosters.concat(roster);
      }
    }
  }

  // async createFirebaseUsers(numUsers)
  async createFirebaseUsers() {
    // const userNames = await this.createUsernames(numUsers);

    const userNames = [
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
    ];

    const users = [];

    for (const name of userNames) {
      const u = {
        username: name,
        email: `${name}@gmail.com`,
      };

      // await createAccount(u.username, u.email, 'password');
      users.push(u);
    }

    const createdUsers = [];

    for (const user of users) {
      const resp = await this.client.user.create({
        data: user,
      });
      createdUsers.push(resp);
    }

    return createdUsers;
  }

  async createLeagueSettings(
    numTeams: number,
    publicJoin: boolean,
    minPlayers: number,
    maxPlayers: number,
    scoring: string,
  ) {
    const waiverSettings: WaiverSettings = await this.client.waiverSettings.create({
      data: {
        waiver_period_hours: 24,
        waiver_order_type: 0,
      },
    });
    const scheduleSettings: ScheduleSettings = await this.client.scheduleSettings.create({
      data: {
        start_week: 1,
        end_week: 14,
        playoff_start_week: 15,
        playoff_end_week: 18,
        num_playoff_teams: 4,
        weeks_per_playoff_matchup: 1,
      },
    });
    const scoringSettings: ScoringSettings = await this.client.scoringSettings.create({
      data: {
        points_per_reception: scoring === 'PPR' ? 1 : 0,
      },
    });
    const tradeSettings: TradeSettings = await this.client.tradeSettings.create({
      data: {
        review_period_hours: 24,
        votes_to_veto_trade: 1,
      },
    });
    const rosterSettings: RosterSettings = await this.client.rosterSettings.create({
      data: {
        num_qb: 1,
        num_rb: 2,
        num_wr: 2,
        num_te: 1,
        num_flex: 1,
        roster_size_limit: 15,
      },
    });
    const draftDate = new Date();
    draftDate.setDate(draftDate.getDate() + 10);
    const draftSettings: DraftSettings = await this.client.draftSettings.create({
      data: {
        date: draftDate,
        seconds_per_pick: 30,
        order_generation_type: 0,
      },
    });
    const leagueSettings: LeagueSettings = await this.client.leagueSettings.create({
      data: {
        num_teams: numTeams,
        public_join: publicJoin,
        min_players: minPlayers,
        max_players: maxPlayers,
        draft_settings_id: draftSettings.id,
        roster_settings_id: rosterSettings.id,
        scoring_settings_id: scoringSettings.id,
        waiver_settings_id: waiverSettings.id,
        trade_settings_id: tradeSettings.id,
        schedule_settings_id: scheduleSettings.id,
      },
    });

    return leagueSettings;
  }

  async createLeague(name, description, commissioner_id, settings_id) {
    const token = randomstring.generate(7);
    const league = {
      name,
      description,
      commissioner_id,
      token,
      settings_id,
    };
    const resp = await this.client.league.create({
      data: league,
    });

    return resp;
  }

  async createTeams(league, users, teamNames) {
    const teams = [];

    for (let i = 0; i < teamNames.length; i++) {
      const token = randomstring.generate(7);
      const ts = await this.client.teamSettings.create({
        data: {},
      });

      const team = {
        name: teamNames[i],
        league_id: league.id,
        token,
        team_settings_id: ts.id,
      };

      const resp = await this.client.team.create({
        data: team,
      });

      teams.push(resp);
    }

    let userNum = 0;
    for (let teamNum = 0; teamNum < teams.length; teamNum++) {
      const team = teams[teamNum];

      for (let i = userNum; i < userNum + 3; i++) {
        await this.client.userToTeam.create({
          data: {
            team_id: team.id,
            user_id: users[i].id,
            is_captain: i == 0,
          },
        });
      }

      userNum += 3;
    }

    return teams;
  }

  async copyRoster(week, oldRoster) {
    const r = {
      week: week,
      team_id: oldRoster.team_id,
      season: oldRoster.season,
    };

    // Create roster
    const newRoster = await this.client.roster.create({
      data: r,
    });

    // Create roster player
    for (const oldPlayer of oldRoster.players) {
      const rp = {
        external_id: oldPlayer.external_id,
        position: oldPlayer.position,
        roster_id: newRoster.id,
        player_id: oldPlayer.player_id,
      };

      await this.client.rosterPlayer.create({
        data: rp,
      });
    }

    const created = await this.client.roster.findFirstOrThrow({
      where: {
        id: newRoster.id,
      },
      include: {
        players: true,
      },
    });

    return created;
  }

  async buildRandomRoster(week, team_id, season, playerIdsUsed) {
    const r = {
      week,
      team_id,
      season,
    };

    const roster = await this.client.roster.create({
      data: r,
    });

    const constraints = {
      QB: 1,
      RB: 2,
      WR: 2,
      TE: 1,
      FLEX: 1,
      TOTAL: 15,
    };

    const allowedPositions = [ 'RB', 'WR', 'TE', 'QB' ];
    const flexPositions = [ 'RB', 'WR', 'TE' ];
    const players = await this.client.player.findMany();
    this.shuffleArray(players);

    for (const p of players) {
      const rp = {
        external_id: p.external_id,
        position: p.position,
        roster_id: roster.id,
        player_id: p.id,
      };

      const allPosFilled =
        constraints['QB'] === 0 &&
        constraints['WR'] === 0 &&
        constraints['RB'] === 0 &&
        constraints['TE'] === 0;

      if (playerIdsUsed.includes(rp.external_id) || !allowedPositions.includes(p.position)) {
        // Skip the player if someone owns them already or if they play a non fantasy position
        continue;
      } else if (constraints[p.position]) {
        await this.client.rosterPlayer.create({
          data: rp,
        });

        constraints[rp.position]--;
        constraints['TOTAL']--;
      } else if (constraints['FLEX'] && flexPositions.includes(p.position)) {
        rp.position = 'FLEX';

        await this.client.rosterPlayer.create({
          data: rp,
        });

        constraints[rp.position]--;
        constraints['TOTAL']--;
      }
      // Once all starting positions have been filled, create the bench
      else if (constraints['TOTAL'] && allPosFilled) {
        rp.position = 'BE';

        await this.client.rosterPlayer.create({
          data: rp,
        });

        constraints[rp.position]--;
        constraints['TOTAL']--;
      }

      if (!constraints['TOTAL']) {
        break;
      }
    }

    const created = await this.client.roster.findFirstOrThrow({
      where: {
        id: roster.id,
      },
      include: {
        players: true,
      },
    });

    return created;
  }

  // Helper methods that don't interact with the database

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ array[i], array[j] ] = [ array[j], array[i] ];
    }
  }

  generateTeamNames(numTeams) {
    const names = [];
    const rand = Math.round(Math.random() * 1000);

    for (let i = 0; i < numTeams; i++) {
      names.push('Team ' + i * rand);
    }

    return names;
  }

  createUsernames(num) {
    const users = [];

    for (let i = 0; i < num; i++) {
      const randomAnimalName = require('random-animal-name');
      let animalName = randomAnimalName();
      animalName = animalName.replaceAll(' ', '').toLowerCase().replaceAll('-', '');

      users.push(`${animalName}${i}`);
    }

    return users;
  }

  generateLeagueNames(numLeagues) {
    const names = [];
    const rand = Math.round(Math.random() * 1000);

    for (let i = 0; i < numLeagues; i++) {
      names.push('League ' + i * rand);
    }

    return names;
  }
}
export default Seed;
