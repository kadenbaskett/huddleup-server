import { PrismaClient } from '@prisma/client';

class DatabaseService {

    client: PrismaClient;

    constructor()
    {
        this.client = new PrismaClient();
    }

    public async createLeague()
    {
        const league = await this.client.league.create({
            data: {
                name: 'Hunter Renfroe Fan Club',
            },
        });

        return league;
    }

    public async getLeagues()
    {
        const leagues = await this.client.league.findMany();
        console.log(leagues);
    }

    public async getTeamsInLeague(leagueId: number)
    {
        return null;
    }

    public async getTeamDetails(teamId: number)
    {
        return null;
    }

    public async getTeamRoster(teamId: number)
    {
        return null;
    }

    public async getLeagueDetails(leagueId: number)
    {
        return null;
    }

    public async getUsersLeagues(userId: number)
    {
        return null;
    }

    public async getUsersTeams(userId: number)
    {
        return null;
    }

    public async submitTransaction()
    {
        return null;
    }

    public async submitTrade()
    {
        return null;   
    }

}

export default DatabaseService;