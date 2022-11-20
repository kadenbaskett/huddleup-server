import { PrismaClient } from '@prisma/client';

class DatabaseService {

    client: PrismaClient;

    constructor()
    {
        this.client = new PrismaClient();
    }

    public async createLeague()
    {
        try {
            const league = await this.client.league.create({
                data: {
                    name: 'Hunter Renfroe Fan Club',
                },
            });

            return league;
        }
        catch(e) {
            return null;
        }
    }

    public async getLeagues()
    {
        try {
            return await this.client.league.findMany();
        }
        catch(e) {
            return null;
        }
    }

    public async getTeamsInLeague(leagueId: number)
    {
        try {
            return await this.client.team.findMany({
                where: { leagueId: leagueId },
            });
        }
        catch(e) {
            return null;
        }
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

    public async getLeagueSettings(leagueId: number)
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

    public async getTeamSchedule()
    {
        return null;
    }

    public async getPlayers()
    {
        return null;
    }

    public async getLeagueSchedule()
    {
        return null;   
    }

    public async getStandings()
    {
        return null;
    }


}

export default DatabaseService;