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
        console.log(league);
    }

    public async getLeagues()
    {
        const leagues = await this.client.league.findMany();
        console.log(leagues);
    }


}

export default DatabaseService;