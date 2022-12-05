import { League, PrismaClient, NFLGame, Player, NFLTeam } from '@prisma/client';

class DatabaseService {

    client: PrismaClient;

    constructor()
    {
        this.client = new PrismaClient();
    }


    // **************** SETTERS & UPDATERS ********************** //

    public async createLeague(): Promise<League>
    {
        try {
            const league: League = await this.client.league.create({
                data: {
                    teams: null,
                    commissioner_id: 0,
                    settings: null,
                },
            });

            return league;
        }
        catch(e) {
           return null; 
        }
    }


    // **************** GETTERS ********************** //

    public async getPlayerDetails(external_player_id: number): Promise<Player>
    {
        try {
            const player = await this.client.player.findFirstOrThrow({
                where: { external_id: external_player_id },
            });

            return player;
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
            return await this.client.player.findMany();
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
            const games = this.client.nFLGame.findMany({
                where: {
                    OR: 
                    [
                        { home_team_id: external_team_id },
                        { away_team_id: external_team_id },
                    ],
                },
            });

            return games;
        }
        catch(e)
        {
            console.log(e);
            return null;
        }
    }


}

export default DatabaseService;