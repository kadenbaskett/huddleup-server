import { League, PrismaClient, NFLGame, Player, NFLTeam, PlayerGameStats, Team, Roster, RosterPlayer, Timeframe, User } from '@prisma/client';

class DatabaseService {

    client: PrismaClient;

    constructor()
    {
        this.client = new PrismaClient();
    }


    // **************** SETTERS & UPDATERS ********************** //

    public async createLeague(commissioner_id: number, name: string): Promise<League>
    {
        try {
            const league: League = await this.client.league.create({
                data: {
                    commissioner_id: commissioner_id,
                    name: name,
                },
            });

            return league;
        }
        catch(e) {
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


    public async dropPlayer(dropPlayerId: number, rosterId: number): Promise<RosterPlayer>
    {
        try {
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

    public async addDropPlayer(addPlayerId: number, dropPlayerId: number, rosterId: number): Promise<RosterPlayer>
    {
        try {
            const rp: RosterPlayer = await this.client.rosterPlayer.update({
                where: {
                    player_id_roster_id: {
                        player_id: dropPlayerId,
                        roster_id: rosterId,
                    },
                },
                data: {
                    player_id: addPlayerId,
                },
            });

            return rp;
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
                    // settings: {
                    //     public_view: true,
                    // },
                },
                include: {
                    teams: {
                        include: {
                            rosters: true,
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


}

export default DatabaseService;