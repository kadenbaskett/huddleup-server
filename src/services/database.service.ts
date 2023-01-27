import { League, PrismaClient, NFLGame, Player, NFLTeam, PlayerGameStats, Team, Roster, RosterPlayer, Timeframe, User, LeagueSettings, WaiverSettings, ScheduleSettings, ScoringSettings, RosterSettings, DraftSettings, TradeSettings, News, PlayerProjections } from '@prisma/client';

class DatabaseService {

    client: PrismaClient;

    constructor()
    {
        this.client = new PrismaClient();
    }


    // **************** SETTERS & UPDATERS ********************** //

    public async createLeague(commissioner_id: number, name: string, description: string, settings: LeagueSettings): Promise<League>
    {
        try {
            const league: League = await this.client.league.create({
                data: {
                    commissioner_id,
                    name,
                    description,
                    settings_id: settings.id,
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


    public async dropPlayer(dropPlayerId: number, rosterId: number, teamId: number, userId: number, week: number): Promise<RosterPlayer>
    {
        try {
            const created = await this.client.transaction.create({
                data: {
                    type: 'Drop',
                    status: '',
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

            // Update the roster player
            const rp: RosterPlayer = await this.client.rosterPlayer.delete({
                where: {
                    player_id_roster_id: {
                        player_id: dropPlayerId,
                        roster_id: rosterId,
                    },
                },
            });

            return rp;
        }
        catch(e) {
           return null;
        }
    }

    public async addPlayer(addPlayerId: number, externalPlayerId: number, rosterId: number, teamId: number, userId: number, week: number): Promise<RosterPlayer>
    {
        // TODO put this all in one database 'transaction' (not referring to our transaction, I'm referring to database transactions that make sure a group of creations/deletions all fail or all pass) so that a player doesn't get added without the player being dropped
        try {
            // Create the transaction
            const created = await this.client.transaction.create({
                data: {
                    type: 'AddDrop',
                    status: '',
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

            // Update the roster player
            const rp: RosterPlayer = await this.client.rosterPlayer.create({
                data: {
                    external_id: externalPlayerId,
                    position: 'BE',
                    roster_id: rosterId,
                    player_id: addPlayerId,
                },
            });

            return rp;
        }
        catch(e) {
           return null;
        }
    }

    public async addDropPlayer(addPlayerId: number, addPlayerExternalId: number, dropPlayerIds: number[], rosterId: number, teamId: number, userId: number, week: number): Promise<Roster>
    {
        // TODO put this all in one database 'transaction' (not referring to our transaction, I'm referring to database transactions that make sure a group of creations/deletions all fail or all pass) so that a player doesn't get added without the player being dropped
        try {
            // Create the transaction
            const created = await this.client.transaction.create({
                data: {
                    type: 'AddDrop',
                    status: '',
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

            // Create new roster player
            await this.client.rosterPlayer.create({
                data: {
                    external_id: addPlayerExternalId,
                    position: 'BE',
                    roster_id: rosterId,
                    player_id: addPlayerId,
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

                // Update the roster player
                await this.client.rosterPlayer.delete({
                    where: {
                        player_id_roster_id: {
                            player_id: id,
                            roster_id: rosterId,
                        },
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
                    matchups: true,
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
                                    user: true,
                                },
                            },
                            related_transactions: {
                              include: {
                                players: {
                                  include: {
                                    player: true,
                                  },
                                },
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
