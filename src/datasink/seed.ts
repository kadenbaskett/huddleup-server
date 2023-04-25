/* eslint-disable @typescript-eslint/no-var-requires */
import {
  DraftSettings,
  LeagueSettings,
  PrismaClient,
  RosterSettings,
  ScheduleSettings,
  ScoringSettings,
  Timeframe,
  TradeSettings,
  WaiverSettings,
} from '@prisma/client';
import { calculateSeasonLength, createMatchups } from '@services/general.service';
import randomstring from 'randomstring';
import DatabaseService from '@/services/database.service';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { firebaseAdminAuth } from '@/server';
import { DRAFT, FANTASY_POSITIONS, FLEX_POSITIONS, ROSTER_START_CONSTRAINTS, SEASON, SEED, SETTINGS } from '@/config/huddleup_config';

/*
 *  Seeds the database with mock data. The simulate league function will
 *  create new users, leagues, teams, rosters, and roster players
 */
class Seed {
  // TODO delete the prisma client from this file
  private client: PrismaClient;
  private dbService: DatabaseService;

  constructor() {
    this.client = new PrismaClient();
    this.dbService = new DatabaseService();
  }

  async createEmptyLeague() {
    const leagueSettings = await this.createLeagueSettings(8, true, 2, 2, 'PPR');
    await this.createLeague('Empty League', 'EMpty League description', 1, leagueSettings.id);
  }

  // TODO how is this different from the other fill league?
  async fillLeagueRandomUsers(leagueId: number) {

    const league: any = await this.dbService.getLeagueWithSettingsAndManagers(leagueId);

    let users = await this.dbService.getUsers();

    // remove users who are on teams from users to be added to league
    league.teams.forEach((team) => {
      team.managers.forEach((manager) => {
        users = users.filter((user) => user.id !== manager.user_id);
      });
    });

    for(const team of league.teams)
    {
      // add managers to unfinished teams
      let numManagers = team.managers.length;
      while (numManagers < league.settings.min_players) {
        const newUser = users[0];

        await this.dbService.userToTeam(team.id, newUser.id, 0);

        users = users.filter((user) => user.id !== newUser.id);
        numManagers++;
      }
    }

    // add remaining teams
    const neededTeams = league.settings.num_teams - league.teams.length;
    const teamNames = this.generateTeamNames(neededTeams);
    await this.createTeams(league, users, teamNames);
  }

    public async createLeagueSettings(
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
            start_week: SEASON.START_WEEK,
            end_week: SEASON.FINAL_SEASON_WEEK,
            playoff_start_week: SEASON.FINAL_SEASON_WEEK + 1,
            playoff_end_week: SEASON.FINAL_PLAYOFF_WEEK,
            num_playoff_teams: SEASON.NUM_PLAYOFF_TEAMS,
            weeks_per_playoff_matchup: SEASON.WEEKS_PER_PLAYOFF_MATCHUP,
        },
        });
        const scoringSettings: ScoringSettings = await this.client.scoringSettings.create({
        data: {
            points_per_reception: scoring === 'PPR' ? 1 : 0,
        },
        });
        const tradeSettings: TradeSettings = await this.client.tradeSettings.create({
        data: {
            review_period_hours: SETTINGS.TRADE.REVIEW_PERIOD_HOURS,
            votes_to_veto_trade: SETTINGS.TRADE.VOTES_TO_VETO,
        },
        });
        const rosterSettings: RosterSettings = await this.client.rosterSettings.create({
        data: {
            num_qb: ROSTER_START_CONSTRAINTS.QB,
            num_rb: ROSTER_START_CONSTRAINTS.RB,
            num_wr: ROSTER_START_CONSTRAINTS.WR,
            num_te: ROSTER_START_CONSTRAINTS.TE,
            num_flex: ROSTER_START_CONSTRAINTS.FLEX,
            roster_size_limit: ROSTER_START_CONSTRAINTS.TOTAL,
        },
        });
        const draftDate = new Date();
        draftDate.setDate(draftDate.getDate() + DRAFT.TIME_FROM_CREATION_TO_START_DEFAULT_DAYS);
        const draftSettings: DraftSettings = await this.client.draftSettings.create({
        data: {
            date: draftDate,
            seconds_per_pick: DRAFT.SECONDS_PER_PICK,
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


  // TODO do we still need this or can we use the random users script
  async fillLeague(leagueId: number) {
    const league: any = await this.dbService.getLeagueWithSettingsAndManagers(leagueId);

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
        const newUser = users[0];
        await this.dbService.userToTeam(team.id, newUser.id, 0);
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
    const teams = await this.dbService.getTeamsInLeague(leagueId);
    await this.simulateTimeframe(1);
    await this.buildRandomRostersSamePlayersEveryWeek(1, 2022, teams);
  }

  async finishDraft(leagueId: number) {
    // get teams in the league
    const teams = await this.client.team.findMany({ where: { league_id: leagueId }, include: {
      rosters: { include: { players: true } },
    } });
    const draftedPlayerIDs = [];
    // get players that have been drafted into the league
    teams.forEach((t)=> {
      if(t.rosters.length > 0) {
        t.rosters[0].players.forEach((p)=> draftedPlayerIDs.push(p.player_id));
      }
    });
    // get all NFL players
    let players = await this.client.player.findMany();
    players = players.filter((p)=> !draftedPlayerIDs.includes(p.id));

    for(let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if(team.rosters.length > 0) {
        const teamRoster = team.rosters[0];
        let numQB = teamRoster.players.filter((p) => p.position === 'QB').length;
        let numWR = teamRoster.players.filter((p) => p.position === 'WR').length;
        let numRB = teamRoster.players.filter((p) => p.position === 'RB').length;
        let numTE = teamRoster.players.filter((p) => p.position === 'TE').length;
        let numFLEX = teamRoster.players.filter((p) => p.position === 'FLEX').length;
        let numPlayers = teamRoster.players.length;
        while (numPlayers < ROSTER_START_CONSTRAINTS.TOTAL) {
          const randomPlayerId = Math.floor(Math.random() * (players.length - 1));
          let selectedPlayerId = players[randomPlayerId].id;
          if(numQB < ROSTER_START_CONSTRAINTS.QB){
            const QBs = players.filter((p)=> p.position === 'QB');
            selectedPlayerId = QBs[0].id;
            numQB++;
          } else if (numWR < ROSTER_START_CONSTRAINTS.WR) {
            const WRs = players.filter((p)=> p.position === 'WR');
            selectedPlayerId = WRs[0].id;
            numWR++;
          } else if (numRB < ROSTER_START_CONSTRAINTS.RB) {
            const RBs = players.filter((p)=> p.position === 'RB');
            selectedPlayerId = RBs[0].id;
            numRB++;
          } else if (numTE < ROSTER_START_CONSTRAINTS.TE) {
            const TEs = players.filter((p)=> p.position === 'TE');
            selectedPlayerId = TEs[0].id;
            numTE++;
          } else if (numFLEX < ROSTER_START_CONSTRAINTS.FLEX) {
            // add a player to the flex spot
            const FLEXs = players.filter((p)=> (FLEX_POSITIONS.includes(p.position)));
            selectedPlayerId = FLEXs[0].id;
            numFLEX++;
          }
          players = players.filter((p) => p.id !== selectedPlayerId);
          await this.dbService.draftPlayer(selectedPlayerId, team.id, leagueId);
          await this.dbService.draftPlayerToRoster(selectedPlayerId, team.id, leagueId);
          numPlayers++;
        }
        const finalTeam = await this.client.team.findFirst({ where: { id: team.id }, include: {
          rosters: { include: { players: true } },
        } });
        console.log(finalTeam.rosters[0].players);
      }
    }
  }

  async simulateMatchups(leagueId: number) {
    const teams = await this.dbService.getTeamsInLeague(leagueId);
    const seasonLength = calculateSeasonLength();
    const matchups = await createMatchups(teams, seasonLength);

    for (const matchup of matchups) {

      await this.dbService.createMatchup(matchup, leagueId);

    }
  }

  async simulateTimeframe(week: number) {
    const timeframes = await this.dbService.getAllTimeframes();

    for(const tf of timeframes)
    {
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
      await this.dbService.updateTimeframe(tf.id, tf);
    }

    const tf: Timeframe = await this.dbService.getTimeframe();

    console.log('Timeframe after simulate timeframe called: ', tf);
  }

  // Updates the timeframe and all rosters 
  async simulateWeek(week: number) {
    const previousTimeframe = await this.dbService.getTimeframe();

    // Update the timeframe object
    await this.simulateTimeframe(week);

    // Remove all the rosters in the future
    await this.dbService.removeAllRostersAfter(week);

    const rosters = await this.dbService.getAllRostersOfWeek(previousTimeframe.week);

    // Make rosters for all future weeks to simulate
    for(const r of rosters)
    {
        for (let i = previousTimeframe.week + 1; i <= week; i++) {
            await this.copyRoster(i, r);
        }
    }
  }

  async seedDB() {
    await this.dbService.clearLeagueStuff();

    const season = SEED.SEASON;
    const currentWeek = SEED.CURRENT_WEEK;
    const numLeagues = SEED.NUM_LEAGUES;
    const numTeams = SEED.NUM_TEAMS;
    const usersPerTeam = SEED.USERS_PER_TEAM;
    const numUsers = usersPerTeam * numTeams;
    const users = await this.createFirebaseUsers();
    const leagueNames = this.generateLeagueNames(numLeagues);

    for (let i = 0; i < leagueNames.length; i++) {
      const commish = users[Math.floor(Math.random() * users.length)];
      try
      {
        await this.simulateLeague(
          users,
          leagueNames[i],
          commish,
          numTeams,
          season,
          currentWeek,
          numUsers,
        );
      }
      catch(error)
      {
        console.log(error);
      }
    }
  }


  async simulateLeague(
    users,
    name,
    commish,
    numTeams,
    season,
    currentWeek,
    numUsers,
  ) {
    await this.simulateTimeframe(currentWeek);
    const teamNames = this.generateTeamNames(numTeams);
    const description = `League description example for seeded league named ${name}`;

    const leagueSettings = await this.createLeagueSettings(numTeams, SEED.PUBLIC_JOIN, SEED.MIN_PLAYERS_PER_TEAM, numUsers, SEED.PPR);
    const league = await this.createLeague(name, description, commish.id, leagueSettings.id);
    const teams = await this.createTeams(league, users, teamNames);

    await this.buildRandomRostersSamePlayersEveryWeek(currentWeek, season, teams);

    const regSeasonLen = calculateSeasonLength();
    const matchups = createMatchups(teams, regSeasonLen);

    for (const matchup of matchups) {
      await this.dbService.createMatchup(matchup, league.id);
    }

    const currentTF: Timeframe = await this.dbService.getTimeframe();

    console.log('Timeframe after seeding: ', currentTF);
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

  async syncDBWithFirebaseUsers() {
    const firebaseUsers = await this.getFirebaseUsers();

    for (const firebaseUser of firebaseUsers) {
          const username = firebaseUser.displayName ?? firebaseUser.email.split('@')[0];
          const email = firebaseUser.email;
          await this.dbService.createUser(username, email);
    }
  }

  async clearFirebaseUsers() {
    const firebaseUsers = await this.getFirebaseUsers();
    const userIds = [];

    for (const firebaseUser of firebaseUsers) {
      userIds.push(firebaseUser.uid);
    }

    await this.deleteFirebaseUsers(userIds);
  }


  async createFirebaseUsers() {
    await this.clearFirebaseUsers();

    // const users = this.createUsernames(100);
    const users = [];

    for (const name of SEED.USERNAMES) {
      const u = {
        username: name,
        email: `${name}@gmail.com`,
      };

      users.push(u);
    }

    const createdUsers = [];

    let firebaseUserCount = 0;
    let dbUserCount = 0;

    for (const user of users) {
      // add to firebase
      this.createFirebaseUser(user.username, user.email, 'password');
      firebaseUserCount ++;

      try{
        // add to database
        const resp = await this.dbService.createUser(user.username, user.email);

        dbUserCount ++;
        createdUsers.push(resp);
      }
      catch(e){
          if(e.message.includes('Unique constraint failed on the constraint: `User_username_key`')){
            console.log('Failed to add user from firebase: Username already exists.');
          }
          else if(e.message.includes('Unique constraint failed on the constraint: `User_email_key')){
            console.log('Failed to add user from firebase: Email already exists.');
          }
          else{
            console.log('Failed to add user from firebase: ', e);
          }
      }
    }

    return createdUsers;
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

    const leagueWithSettings = await this.client.league.findFirst({
      where: {
        id: resp.id,
      },
      include: {
        settings: true,
      },
    });

    return leagueWithSettings;
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

      const teamResp = await this.dbService.createTeamWithRoster(team);

      teams.push(teamResp);
    }

    let userNum = 0;
    for (let teamNum = 0; teamNum < teams.length; teamNum++) {
      const team = teams[teamNum];

      for (let i = userNum; i < userNum + league.settings.min_players; i++) {
        await this.client.userToTeam.create({
          data: {
            team_id: team.id,
            user_id: users[i].id,
            is_captain: i == 0,
          },
        });
      }

      userNum += league.settings.min_players;
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

    const roster = await this.client.roster.upsert({
      where: {
        season_week_team_id: {
          season: season,
          week: week,
          team_id: team_id,
        },
      },
      update: {},
      create: r,
    });

    const constraints = {
      QB: 1,
      RB: 2,
      WR: 2,
      TE: 1,
      FLEX: 1,
      TOTAL: 15,
    };

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

      if (playerIdsUsed.includes(rp.external_id) || !FANTASY_POSITIONS.includes(p.position)) {
        // Skip the player if someone owns them already or if they play a non fantasy position
        continue;
      } else if (constraints[p.position]) {
        await this.client.rosterPlayer.create({
          data: rp,
        });

        constraints[rp.position]--;
        constraints['TOTAL']--;
      } else if (constraints['FLEX'] && FLEX_POSITIONS.includes(p.position)) {
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
    const generate = require('project-name-generator');
    const names = [];

    for (let i = 0; i < numTeams; i++) {
      names.push(generate().spaced);
    }

    return names;
  }

  createUsernames(num) {
    const users = [];
    console.log('create usernames');

    for (let i = 0; i < num; i++) {
      const randomAnimalName = require('random-animal-name');
      let animalName = randomAnimalName();
      animalName = animalName.replaceAll(' ', '').toLowerCase().replaceAll('-', '');

      users.push(`${animalName}${i}`);
    }

    return users;
  }

  generateLeagueNames(numLeagues) {
    const generate = require('sports-team-name-generator');
    const names = [];

    for (let i = 0; i < numLeagues; i++) {
      names.push(generate());
    }

    return names;
  }

  // FIREBASE HELPER FUNCTIONS
  getFirebaseUsers(nextPageToken?: string, allUsers: UserRecord[] = []): Promise<UserRecord[]> {
    return firebaseAdminAuth.listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        allUsers.push(...listUsersResult.users);
        if (listUsersResult.pageToken) {
          return this.getFirebaseUsers(listUsersResult.pageToken, allUsers);
        } else {
          return allUsers;
        }
      });
  }

  async deleteFirebaseUsers(userIds: string[]){
    await firebaseAdminAuth
  .deleteUsers(userIds)
  .then((deleteUsersResult) => {
    console.log(`Successfully deleted ${deleteUsersResult.successCount} users`);
    console.log(`Failed to delete ${deleteUsersResult.failureCount} users`);
    deleteUsersResult.errors.forEach((err) => {
      console.log(err.error.toJSON());
    });
  })
  .catch((error) => {
    console.log('Error deleting users:', error);
  });
  }

  createFirebaseUser(username: string, email: string, password: string){
    firebaseAdminAuth
  .createUser({
    displayName: username,
    email: email,
    password: password,
  })
  .then((userRecord) => {
    // console.log('Successfully created new user:', userRecord.displayName);
  })
  .catch((error) => {
    console.log('Error creating new user:', error);
  });
  }
}
export default Seed;
