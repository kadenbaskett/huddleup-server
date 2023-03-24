import { TransactionWithPlayers } from '@/interfaces/prisma.interface';
import { League, PrismaClient, NFLGame, Player, NFLTeam, PlayerGameStats, Team, Roster, RosterPlayer, Timeframe, User, LeagueSettings, WaiverSettings, ScheduleSettings, ScoringSettings, RosterSettings, DraftSettings, TradeSettings, News, PlayerProjections, TransactionPlayer, Transaction, TransactionAction, TeamSettings, UserToTeam } from '@prisma/client';


export async function createTeamWithRoster(data): Promise<Team> {
    const team: Team = await this.client.team.create(data);

    return team;
}

class DatabaseService {

    client: PrismaClient;

    constructor()
    {
        this.client = new PrismaClient();
    }

    // **************** SETTERS & UPDATERS ********************** //

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

    public async createLeagueSettings(numTeams: number, publicJoin: boolean, minPlayers: number, maxPlayers: number, scoring: string): Promise<LeagueSettings>
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
           return null;
        }
    }

    public async createTeam(leagueId: number, teamName : string, teamOwnerId: number, settingsId:number, token: string): Promise<Team>
    {
        try {
            const team: Team = await createTeamWithRoster(
                {
                    data: {
                        league_id: leagueId,
                        name: teamName,
                        team_settings_id: settingsId,
                        token,
                    },
                },
            );

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

    public async getLeagueInfo(leagueId: number): Promise<League>
    {
        try {
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
                },
            });
        }
        catch(e)
        {
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
                                season: timeframe.season,
                            },
                        },
                        include: {
                            game: true,
                        },
                    },
                    current_nfl_team: true,
                    player_projections: {
                        where: {
                            game: {
                                season: timeframe.season,
                            },
                        },
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
}

export default DatabaseService;
