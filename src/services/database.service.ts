import { PrismaClient } from '@prisma/client';

class DatabaseService {

    client: PrismaClient;

    constructor()
    {
        this.client = new PrismaClient();
    }

    /*
    public async getPlayerDetails(external_player_id): Promise<Player>
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

    public async getTeamNFLGames(external_team_id: number): Promise<NFLGame[]>
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
    */

    // public async createLeague(): Promise<League>
    // {
    //     try {
    //         const league: League = await this.client.league.create({
    //             data: {
    //                 teams: null,
    //                 commissioner: 0,
    //                 settings: null,
    //             },
    //         });

    //         return league;
    //     }
    //     catch(e) {
    //        return null; 
    //     }
    // }
}

export default DatabaseService;