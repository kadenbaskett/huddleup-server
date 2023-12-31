import { TransactionWithPlayers, LeagueInfo, LeagueWithTeamAndSettings } from '@/interfaces/prisma.interface';
import { League, PrismaClient, NFLGame, Player, NFLTeam, PlayerGameStats, Team, Roster, RosterPlayer, Timeframe, User, LeagueSettings, WaiverSettings, ScheduleSettings, ScoringSettings, RosterSettings, DraftSettings, TradeSettings, News, PlayerProjections, TransactionPlayer, Transaction, TransactionAction, TeamSettings, UserToTeam, DraftPlayer, DraftQueue, DraftOrder, Matchup } from '@prisma/client';
import { ROSTER_START_CONSTRAINTS } from '@/config/huddleup_config';


/*
 *  In theory this is supposed to be one of a few places we have a prisma client and interact with the DB
 *  Should be used for fantasy related data - querying our own models rather than the NFL models
 */
class DatabaseService {

    private client: PrismaClient;

    constructor()
    {
        this.client = new PrismaClient();
    }

    async clearForSeed() {
        this.clearLeagueStuff();
        await this.client.user.deleteMany();
    }


    async clearLeagueStuff() {
        // The order that the tables are cleared in is important
        // We can't clear a table that is referenced by another table using a foreign key without first clearing
        // the table that references it
        await this.client.draftPlayer.deleteMany();
        await this.client.draftOrder.deleteMany();
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

        console.log('Cleared db successfully of old league data');
    }

    // SHARED //
    public async createTeamWithRoster(data): Promise<Team> {
        const client = new PrismaClient();
        const team: Team = await client.team.create({ data });

        const rosterOneData = {
            week: 1,
            team_id: team.id,
            season: 2022,
        };

        await client.roster.create({
            data: rosterOneData,
        });

        return team;
    }

    public async getDraftTime(leagueId: number): Promise<Date>
    {
        try {
            const leagueSettings = await this.client.leagueSettings.findFirst({
                where: {
                    league: {
                        id: leagueId,
                    },
                },
                include: {
                    draft_settings: true,
                },
            });

            return leagueSettings.draft_settings.date;
        }
        catch(err)
        {
            console.log(err);
            return null;
        }
    }

    public async leagueHasEnoughTeams(leagueID: number): Promise<boolean>
    {
        try{
            const league: LeagueWithTeamAndSettings = await this.client.league.findFirst(
                {
                    where:
                    {
                        id: leagueID,
                    },
                    include:
                    {
                        settings: true,
                        teams: true,
                    },
                },
            );

            if(league.settings.num_teams === league.teams.length)
            {
                return true;
            }

            return false;

        }
        catch(e)
        {
            return false;
        }
    }



    public async getLeaguesDraftingSoon(bufferTimeFutureMS: number, bufferTimePastMS: number): Promise<League[]>
    {
        try {
            const pastDate = new Date();
            const futureDate = new Date();
            futureDate.setMilliseconds(futureDate.getMilliseconds() + bufferTimeFutureMS);
            pastDate.setMilliseconds(pastDate.getMilliseconds() - bufferTimePastMS);

            // If the draft is set to start between now and the compareDate
            const leagues: League[] = await this.client.league.findMany({
                where: {
                    settings: {
                        draft_settings: {
                            date: {
                                lte: futureDate,
                                gte: pastDate,
                            },
                        },
                    },
                },
            });

            return leagues;
        }
        catch(err)
        {
            console.log(err);
            return null;
        }
    }

    // **************** SETTERS & UPDATERS ********************** //
    public async createMatchup(matchup, leagueId): Promise<Matchup>
    {
        try {
            const m = await this.client.matchup.create({
                data: {
                ...matchup,
                league_id: leagueId,
                },
            });

            return m;
        }
        catch(e) {
           return null;
        }
    }


    public async createLeague(commissioner_id: number, name: string, description: string, settings: LeagueSettings, token: string): Promise<League>
    {
        try {
            const league: League = await this.client.league.create({
                data: {
                    commissioner_id,
                    name,
                    description,
                    settings_id: settings.id,
                    token,
                },
            });

            return league;
        }
        catch(e) {
           return null;
        }
    }


  async createLeagueSettings(numTeams: number, publicJoin: boolean, minPlayers: number, maxPlayers: number, scoring: string, draftDate: Date): Promise<LeagueSettings>
  {
    try {
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
    } catch(e) {
      return null;
    }
  }

    public async createUser(username: string, email: string): Promise<User>
    {
        try {
            const user: User = await this.client.user.create({
                data: {
                    username,
                    email,
                },
            });

            return user;
        }
        catch(e) {
          if(e.message.includes('Unique constraint failed on the constraint: `User_username_key`')){
            console.log('Failed to add user from firebase: Username already exists.');
          }
          else if(e.message.includes('Unique constraint failed on the constraint: `User_email_key')){
            console.log('Failed to add user from firebase: Email already exists.');
          }
          else{
            console.log('Failed to add user from firebase: ', e);
          }
           return null;
        }
    }

    public async createTeam(leagueId: number, teamName : string, teamOwnerId: number, settingsId:number, token: string): Promise<Team>
    {
        try {
            const data = {
                        league_id: leagueId,
                        name: teamName,
                        team_settings_id: settingsId,
                        token,
                    };
            const team: Team = await this.createTeamWithRoster(data);

            return team;
        }
        catch(e) {
           return null;
        }
    }

    public async deleteTeam(teamId: number, leagueId: number)
    {
        try {
           await this.client.team.deleteMany({
            where:{
                id: teamId,
                league_id:leagueId,
            },
           });

           return true;
        }
        catch(e) {
            console.log('e', e);
           return false;
        }
    }

    public async userToTeam(team_id: number, user_id:number, is_captain: number): Promise<UserToTeam>
    {
        try {
            const userToTeam: UserToTeam = await this.client.userToTeam.create({
                data: {
                    team_id,
                    user_id,
                    is_captain: is_captain == 1,
                },
            });

            return userToTeam;
        }
        catch(e) {
           return null;
        }
    }

    public async removeUserFromTeam(team_id: number, user_id:number)
    {
        try {
            await this.client.userToTeam.deleteMany({
                where:{
                    team_id,
                    user_id,
                },
            });
            return true;
        }
        catch(e) {
           return false;
        }
    }

    public async createTeamSettings(): Promise<TeamSettings>
    {
        try{
           const teamSettings: TeamSettings = await this.client.teamSettings.create({
            data: {
            },
           });

           return teamSettings;
        }
        catch(e)
        {return null;}
    }

    public async deleteTeamSettings(team_settings_id: number)
    {
        try{
           await this.client.teamSettings.deleteMany({
            where:
            {
                id: team_settings_id,
            },
           });

           return true;
        }
        catch(e)
        {
            return false;}
    }

    public async proposeDropPlayer(dropPlayerId: number, rosterId: number, teamId: number, userId: number, week: number)
    {
        try {

            const created = await this.client.transaction.create({
                data: {
                    type: 'Drop',
                    status: 'Pending',
                    creation_date: new Date(),
                    expiration_date: new Date(),
                    execution_date: new Date(),
                    week: week,
                    related_team_id: teamId,
                    proposing_team_id: teamId,
                    user_id: userId,
                },
            });

            // Create drop transaction players
            await this.client.transactionPlayer.create({
                data: {
                    transaction_id: created.id,
                    player_id: dropPlayerId,
                    joins_proposing_team: false,
                },
            });
            return true;
        }
        catch(e) {
           return false;
        }
    }

    public async editLineup(rosterPlayerId: number, newPosition: string): Promise<RosterPlayer>
    {
        try {
            const rp = await this.client.rosterPlayer.update({
                where: {
                    id: rosterPlayerId,
                },
                data: {
                    position: newPosition,
                },
            });

            return rp;
        }
        catch(err)
        {
            return null;
        }
    }

    public async proposeAddPlayer(addPlayerId: number, externalPlayerId: number, rosterId: number, teamId: number, userId: number, week: number): Promise<RosterPlayer>
    {
        // TODO put this all in one database 'transaction' (not referring to our transaction, I'm referring to database transactions that make sure a group of creations/deletions all fail or all pass) so that a player doesn't get added without the player being dropped
        try {
            // Create the transaction
            const created = await this.client.transaction.create({
                data: {
                    type: 'Add',
                    status: 'Pending',
                    creation_date: new Date(),
                    expiration_date: new Date(),
                    execution_date: new Date(),
                    week: week,
                    related_team_id: teamId,
                    proposing_team_id: teamId,
                    user_id: userId,
                },
            });

            // Create add transaction players
            await this.client.transactionPlayer.create({
                data: {
                    transaction_id: created.id,
                    player_id: addPlayerId,
                    joins_proposing_team: true,
                },
            });
        }
        catch(e) {
           return;
        }
    }

    public async draftPlayerToRoster(player_id: number, team_id: number, league_id: number) {
      try {
        const player = await this.client.player.findFirst({
          where: {
            id: player_id,
          },
        });

        const roster = await this.client.roster.findFirst({
          where: {
            team_id: team_id,
            week: 1,
          },
          include: {
            players: true,
        },
        });

        let position = 'BE';

        const positionedPlayers = roster.players.filter((p)=> p.position === player.position);

        switch(player.position) {
          case('QB'):
            if (positionedPlayers.length < ROSTER_START_CONSTRAINTS.QB) position = 'QB';
            break;
          case('WR'):
            if(positionedPlayers.length < ROSTER_START_CONSTRAINTS.WR) position = 'WR';
            break;
          case('RB'):
            if(positionedPlayers.length < ROSTER_START_CONSTRAINTS.RB) position = 'RB';
            break;
          case('TE'):
            if(positionedPlayers.length < ROSTER_START_CONSTRAINTS.TE) position = 'TE';
            break;
        }

        if(position === 'BE') {
          const benchedPlayers = roster.players.filter((p)=> p.position === 'FLEX');
          if (benchedPlayers.length < 1) position = 'FLEX';
        }

        await this.client.rosterPlayer.create({
          data: {
              external_id: player.external_id,
              position: position,
              roster_id: roster.id,
              player_id: player_id,
          },
        });
      } catch (e) {
        return;
      }
    }


    public async proposeTrade(sendPlayerIds: number[], recPlayerIds: number[], proposeRosterId: number, relatedRosterId: number, proposeTeamId: number, relatedTeamId: number, userId: number, week: number): Promise<Transaction> {
        try {
            const creation = new Date();
            // TODO make execution nullable in DB
            const execution = new Date();
            const expiration = new Date();

            expiration.setDate(expiration.getDate() + 7);

            const transaction: Transaction = await this.client.transaction.create({
                data: {
                    type: 'Trade',
                    status: 'Pending',
                    creation_date: creation,
                    expiration_date: expiration,
                    execution_date: execution,
                    week: week,
                    proposing_team_id: proposeTeamId,
                    related_team_id: relatedTeamId,
                    user_id: userId,
                },
            });

            for(let i = 0; i < sendPlayerIds.length; i++)
            {
                await this.client.transactionPlayer.create({
                    data: {
                        transaction_id: transaction.id,
                        player_id: sendPlayerIds[i],
                        joins_proposing_team: false,
                    },
                });
            }

            for(let i = 0; i < recPlayerIds.length; i++)
            {
                await this.client.transactionPlayer.create({
                    data: {
                        transaction_id: transaction.id,
                        player_id: recPlayerIds[i],
                        joins_proposing_team: true,
                    },
                });
            }

            return transaction;
        }
        catch(err)
        {
            console.log(err);
            return null;
        }
    }

    public async proposeAddDropPlayer(addPlayerId: number, addPlayerExternalId: number, dropPlayerIds: number[], rosterId: number, teamId: number, userId: number, week: number): Promise<Roster>
    {
        // TODO put this all in one database 'transaction' (not referring to our transaction, I'm referring to database transactions that make sure a group of creations/deletions all fail or all pass) so that a player doesn't get added without the player being dropped
        try {
            // Create the transaction
            const created = await this.client.transaction.create({
                data: {
                    type: 'AddDrop',
                    status: 'Pending',
                    creation_date: new Date(),
                    expiration_date: new Date(),
                    execution_date: new Date(),
                    week: week,
                    related_team_id: teamId,
                    proposing_team_id: teamId,
                    user_id: userId,
                },
            });

            // Create add transaction player
            await this.client.transactionPlayer.create({
                data: {
                    transaction_id: created.id,
                    player_id: addPlayerId,
                    joins_proposing_team: true,
                },
            });

            // For each player selected to drop, create the transaction player and update the roster player
            for(const id of dropPlayerIds)
            {
                // Create drop transaction players
                await this.client.transactionPlayer.create({
                    data: {
                        transaction_id: created.id,
                        player_id: id,
                        joins_proposing_team: false,
                    },
                });
            }

            const updatedRoster = await this.client.roster.findFirst({
                where: {
                    id: rosterId,
                },
            });

            return updatedRoster;
        }
        catch(e) {
           return null;
        }
    }

    // **************** VALIDATE********************** //
    public async validateNewUser(email: string, username: string): Promise<string>
    {
        try {
            const userByEmail: User = await this.client.user.findFirst({
                where: { email },
            });

            if(userByEmail){
                return 'Account with email exists';
            }

            const userByUsername: User = await this.client.user.findFirst({
                where: { username },
            });

            if(userByUsername){
                return 'Account with username exists';
            }

            return null;
        }
        catch(err) {
           return err;
        }
    }

    // **************** GETTERS ********************** //

    public async getUser(email: string): Promise<User>
    {
        try {
            const user: User = await this.client.user.findFirstOrThrow({
                where: { email },
            });

            return user;
        }
        catch(e) {
           return null;
        }
    }

    public async getPlayerDetails(external_player_id: number): Promise<Player>
    {
        try {
            return await this.client.player.findFirstOrThrow({
                where: { external_id: external_player_id },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getAllPlayersDetails(): Promise<Player[]>
    {
        try {
            return await this.client.player.findMany({
                include: {
                    current_nfl_team: true,
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getAllTimeframes(): Promise<Timeframe[]>
    {
        try {
            return await this.client.timeframe.findMany();
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async updateTimeframe(timeframeId, timeframeData): Promise<Timeframe[]>
    {
        try {
            await this.client.timeframe.update({ where: { id: timeframeId }, data: timeframeData });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    // Gets the current timeframe, or if the season has ended, gets the last regular season timeframe
    public async getTimeframe(): Promise<Timeframe>
    {
        try {
            const current = await this.client.timeframe.findFirst({
                where: {
                    type: 1,
                    has_ended: false,
                    has_started: true,
                },
            });

            if(!current)
            {
                return await this.client.timeframe.findFirstOrThrow({
                    where: {
                        type: 1,
                        has_ended: true,
                        has_started: true,
                    },
                    orderBy: [
                        {
                            week: 'desc',
                        },
                        {
                            season: 'desc',
                        },
                    ],
                    take: 1,
                });
            }
            else
            {
                return current;
            }
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getUserTeams(userID: number): Promise<Team[]>
    {
        try {
            return await this.client.team.findMany({
                where: {
                    managers: {
                        some: {
                            user_id: userID,
                        },
                    },
                },
                include: {
                    league: true,
                    rosters: {
                        include: {
                            players: true,
                        },
                    },
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }


    public async getTeamRoster(teamID: number, week: number): Promise<Roster>
    {
        try {
            return await this.client.roster.findFirstOrThrow({
                where: {
                    team_id: teamID,
                    week: week,
                },
                include: {
                    players: true,
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getTeamPendingTransactions(teamID: number): Promise<TransactionWithPlayers[]>
    {
        try
        {
            return await this.client.transaction.findMany(
                {
                    where:{
                        proposing_team_id: teamID,
                        status: 'Pending',

                    },
                    include:{
                        players: true,
                        // {
                        //     include:{
                        //         player:true,
                        //     },
                        // },
                    },
                },
            );
        }
        catch(e)
        {
            return null;
        }
    }

    public async removeAllRostersAfter(week: number): Promise<void> {
        try {
            await this.client.roster.deleteMany({
                where: {
                    week: {
                        gt: week,
                    },
                },
            });
        }
        catch(error)
        {
            console.log(error);
            return null;
        }
    }

    public async getAllRostersOfWeek(week: number): Promise<Roster[]>
    {
        try {
                const rosters = await this.client.roster.findMany({
                    where: {
                        week,
                    },
                    include: {
                        players: true,
                    },
                });

                return rosters;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getCurrentTeamRoster(teamID: number): Promise<Roster[]>
    {
        try {
            const timeframe = await this.getTimeframe();

            return await this.client.roster.findMany({
                where: {
                    team_id: teamID,
                    week: timeframe.week,
                },
                include: {
                    players: true,
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getLeagueWithSettingsAndManagers(leagueId: number): Promise<LeagueWithTeamAndSettings> {
        try {
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

            return league;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }

    }

    public async getLeagueInfo(leagueId: number): Promise<LeagueInfo>
    {
        try {

            const timeframe = await this.getTimeframe();

            return await this.client.league.findFirstOrThrow({
                where: {
                    id: leagueId,
                },
                include: {
                    matchups: {
                      include: {
                        away_team: {
                          include: {
                            managers: {
                              include: {
                                user: true,
                              },
                            },
                          },
                        },
                        home_team: {
                          include: {
                            managers: {
                              include: {
                                user: true,
                              },
                            },
                          },
                        },
                      },
                    },
                    settings: {
                        include: {
                            roster_settings: true,
                            schedule_settings: true,
                            scoring_settings: true,
                            trade_settings: true,
                            waiver_settings: true,
                            draft_settings: {
                                include: {
                                    order: true,
                                },
                            },
                        },
                    },
                    teams: {
                        include: {
                            rosters: {
                                include: {
                                    players: {
                                        include: {
                                            player: {
                                                include: {
                                                    player_game_stats: {
                                                        where: {
                                                            game: {
                                                                week: {
                                                                    lte: timeframe.week,
                                                                },
                                                            },
                                                        } ,
                                                        include: {
                                                            game: true,
                                                        },
                                                    },
                                                    roster_players: {
                                                        include: {
                                                            roster: {
                                                                include: {
                                                                    team: true,
                                                                },
                                                            },
                                                        },
                                                    },
                                                    player_projections: {
                                                        where: {
                                                            game: {
                                                                week: {
                                                                    lte: timeframe.week,
                                                                },
                                                            },
                                                        } ,
                                                        include: {
                                                            game: true,
                                                        },
                                                    },
                                                    current_nfl_team: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            managers: {
                                include: {
                                    user: true,
                                },
                            },
                            proposed_transactions: {
                                include: {
                                    players: {
                                      include: {
                                        player: true,
                                      },
                                    },
                                    transaction_actions: {
                                      include: {
                                        user: true,
                                      },
                                    },
                                    user: true,
                                    proposing_team: true,
                                    related_team: true,
                                },
                            },
                            related_transactions: {
                              include: {
                                players: {
                                  include: {
                                    player: true,
                                  },
                                },
                                transaction_actions: {
                                  include: {
                                    user: true,
                                  },
                                },
                                related_team: true,
                                proposing_team: true,
                            },
                            },
                            home_matchups: true,
                            away_matchups: true,

                        },
                    },
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }


    public async getUserLeagues(userID: number): Promise<League[]>
    {
        try {
            return await this.client.league.findMany({
                where: {
                    teams: {
                        some: {
                            managers: {
                                some: {
                                    user_id: userID,
                                },
                            },
                        },
                    },
                },
                include: {
                    teams: true,
                    settings: {
                        include: {
                            roster_settings: true,
                        },
                    },
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getUsers(): Promise<User[]>
    {
        try {
            return await this.client.user.findMany({
                include: {
                    user_to_team: {
                        include: {
                            team:true,
                        },
                    },
                },
            });
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async getPublicLeagues(): Promise<League[]>
    {
        try {
            return await this.client.league.findMany({
                where: {
                    settings: {
                        public_join: true,
                    },
                },
                include: {
                    teams: {
                        include: {
                            rosters: true,
                            managers:true,
                        },

                    },
                    settings:
                    {
                        include: {
                            scoring_settings: true,
                        },
                    },

                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getPrivateLeagues(): Promise<League[]>
    {
        try {
            return await this.client.league.findMany({
                where: {
                    settings: {
                        public_join: false,
                    },
                },
                include: {
                    teams: {
                        include: {
                            rosters: true,
                            managers:true,
                        },

                    },
                    settings:
                    {
                        include: {
                            scoring_settings: true,
                        },
                    },

                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getLeaguePlayers(leagueId: number): Promise<Player[]>
    {
        try {
            const timeframe = await this.getTimeframe();

            return await this.client.player.findMany({
                include: {
                    roster_players: {
                        where: {
                            roster: {
                                team: {
                                    league_id: leagueId,
                                },
                                week: timeframe.week,
                            },
                        },
                        include: {
                            roster: {
                                include: {
                                    team: true,
                                },
                            },
                        },
                    },
                    player_game_stats: {
                        where: {
                            game: {
                                week: {
                                    lte: timeframe.week,
                                },
                            },
                        } ,
                        include: {
                            game: true,
                        },
                    },
                    current_nfl_team: true,
                    player_projections: {
                        where: {
                            game: {
                                week: {
                                    lte: timeframe.week,
                                },
                            },
                        } ,
                        include: {
                            game: true,
                        },
                    },
                },
                // TODO order by projected stats
                orderBy: {
                },
            });

        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getAllPlayersStats(): Promise<PlayerGameStats[]>
    {
        try {
            const timeframe = await this.getTimeframe();

            return await this.client.playerGameStats.findMany({
                where: {
                    team: {
                        season: timeframe.season,
                    },
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getAllPlayersProjections(): Promise<PlayerProjections[]>
    {
        try {
            const timeframe = await this.getTimeframe();

            return await this.client.playerGameStats.findMany({
                where: {
                    team: {
                        season: timeframe.season,
                    },
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getPlayerGameLogs(player_id: number): Promise<PlayerGameStats[]>
    {
        try {
            const timeframe = await this.getTimeframe();

            return await this.client.playerGameStats.findMany({
                where: {
                    external_player_id: player_id,
                    team: {
                        season: timeframe.season,
                    },
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getNFLTeams(): Promise<NFLTeam[]>
    {
        try {
            return await this.client.nFLTeam.findMany();
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getNFLTeamGames(external_team_id: number): Promise<NFLGame[]>
    {
        try {
            return this.client.nFLGame.findMany({
                where: {
                    OR:
                    [
                        { home_team_id: external_team_id },
                        { away_team_id: external_team_id },
                    ],
                },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getNews(amount: number): Promise<News[]>
    {
        try {
            const news = this.client.news.findMany({
                take: amount,
            },
            );

            return news;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getDraftPlayers(leagueId: number): Promise<DraftPlayer[]> {
        try {
            const draftPlayers: DraftPlayer[] = await this.client.draftPlayer.findMany({
                where: {
                    league_id: leagueId,
                 },
            });

            return draftPlayers;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getDraftOrder(leagueId: number): Promise<DraftOrder[]>
    {
        try {
            const league: League = await this.client.league.findFirst({
                where: {
                    id: leagueId,
                },
            });
            const leagueSettings: LeagueSettings = await this.client.leagueSettings.findFirst({
                where: {
                    id: league.settings_id,
                },
            });
            const draftSettings: DraftSettings = await this.client.draftSettings.findFirst({
                where: {
                    id: leagueSettings.draft_settings_id,
                },
            });
            const draftOrder: DraftOrder[] = await this.client.draftOrder.findMany({
                where: {
                    draft_settings_id: draftSettings.id,
                },
            });
            return draftOrder;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async getDraftQueue(leagueId: number): Promise<DraftQueue[]> {
        try {
            const draftQueue: DraftQueue[] = await this.client.draftQueue.findMany({
                where: {
                    league_id: leagueId,
                 },
            });

            return draftQueue;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getDraftPickNumber(leagueId: number) {
        const numPicks: DraftPlayer[] = await this.client.draftPlayer.findMany({
            where: {
                league_id: leagueId,
            },
        });

        return numPicks.length + 1;
    }

    public async draftPlayer(playerId: number, teamId: number, leagueId: number): Promise<DraftPlayer> {
        try {
            const pickNum = await this.getDraftPickNumber(leagueId);

            const dp: DraftPlayer = await this.client.draftPlayer.create({
                data: {
                    league_id: leagueId,
                    player_id: playerId,
                    team_id: teamId,
                    pick_number: pickNum,
                 },
            });

            return dp;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async queuePlayer(playerId: number, teamId: number, leagueId: number, order: number): Promise<DraftQueue> {
        try {
            const qp: DraftQueue = await this.client.draftQueue.create({
                data: {
                    league_id: leagueId,
                    player_id: playerId,
                    team_id: teamId,
                    order: order,
                 },
            });

            return qp;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }


    // TODO this might fail prisma because of the constraint of orders on the queue
    public async swapQueuePlayers(qPlayerOneId: number, qPlayerTwoId: number): Promise<DraftQueue[]> {
        try {

            const qp1: DraftQueue = await this.client.draftQueue.findFirst({
                where: {
                    id: qPlayerOneId,
                },
            });

            const qp2: DraftQueue = await this.client.draftQueue.findFirst({
                where: {
                    id: qPlayerTwoId,
                },
            });

            const updated: DraftQueue[] = await this.client.$transaction([
                this.client.draftQueue.update({
                    where: {
                        id: qPlayerOneId,
                    },
                    data: {
                        order: qp2.order,
                    },
                }),
                this.client.draftQueue.update({
                    where: {
                        id: qPlayerTwoId,
                    },
                    data: {
                        order: qp1.order,
                    },
                }),
            ]);

            return updated;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }


    public async removeQueuePlayer(qPlayerId: number): Promise<void> {
        try {
            await this.client.draftQueue.delete({
                where: {
                    id: qPlayerId,
                 },
            });
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getLeagueSettings(leagueId): Promise<LeagueSettings> {
        const league: League = await this.client.league.findFirst({
            where: {
                id: leagueId,
            },
        });

        const leagueSettings: LeagueSettings = await this.client.leagueSettings.findFirst({
            where: {
                id: league.settings_id,
            },
        });

        return leagueSettings;
    }

    public async setDraftDate(draftDate, leagueId): Promise<DraftSettings> {
        try {
            const leagueSettings = await this.getLeagueSettings(leagueId);

            const draftSettings: DraftSettings = await this.client.draftSettings.update({
                where: {
                    id: leagueSettings.draft_settings_id,
                },
                data: {
                    date: draftDate,
                },
            });

            return draftSettings;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    public async getTeamsInLeague(leagueId): Promise<Team[]> {
        try {

            const teams: Team[] = await this.client.team.findMany({
                where: {
                    league_id: leagueId,
                },
            });

            return teams;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

    private shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [ array[i], array[j] ] = [ array[j], array[i] ];
        }
    }

    public async hasCorrectDraftOrderLength(leagueId: number): Promise<boolean>
    {
        try {
            const draftOrder: DraftOrder[] = await this.client.draftOrder.findMany({
                where: {
                    team: {
                        league_id: leagueId,
                    },
                },
            });
            const teams: Team[] = await this.getTeamsInLeague(leagueId);

            return draftOrder.length === teams.length;
        }
        catch (err)
        {
            console.log(err);
            return null;
        }
    }

    public async setRandomDraftOrder(leagueId): Promise<void> {
        try {
            const leagueSettings: LeagueSettings = await this.getLeagueSettings(leagueId);
            const teams: Team[] = await this.getTeamsInLeague(leagueId);
            this.shuffleArray(teams);

            for(let pickNum = 1; pickNum <= teams.length; pickNum++)
            {
                const team = teams[pickNum - 1];

                await this.client.draftOrder.upsert({
                    where: {
                        team_id: team.id,
                    },
                    update: {
                      pick_number: pickNum,
                      team_id: team.id,
                      draft_settings_id: leagueSettings.draft_settings_id,
                    },
                    create: {
                      pick_number: pickNum,
                      team_id: team.id,
                      draft_settings_id: leagueSettings.draft_settings_id,
                    },
                });
            }
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }

}

export default DatabaseService;
