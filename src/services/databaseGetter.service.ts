import {
  NFLGame,
  Player,
  PrismaClient,
  Timeframe,
  PlayerGameStats,
  News,
  PlayerProjections,
  NFLTeam,
} from '@prisma/client';


/*
 * This is supposed to be one of the only places that we interact with the database (via a prisma client)
 * It should be used ONLY to query from the DB
 */
class DatabaseGetterService {

  client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  // ***************** GETTERS ******************

  public async getPlayers(): Promise<Player[]> {
    try {
      return await this.client.player.findMany();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getNews(): Promise<News[]> {
    try {
      return await this.client.news.findMany();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getAllPlayerProjections(): Promise<PlayerProjections[]> {
    try {
      return this.client.playerProjections.findMany();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getTimeframe(): Promise<Timeframe> {
    try {
      const current = await this.client.timeframe.findFirst({
        where: {
          type: 1,
          has_ended: false,
          has_started: true,
        },
      });

      if (!current) {
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
      } else {
        return current;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getNFLTeams(): Promise<NFLTeam[]> {
    try {
      const teams = this.client.nFLTeam.findMany();

      return teams;
    } catch (e) {
      console.log(e);
      return null;
    }
  }


  public async getAllNFLGames(): Promise<NFLGame[]> {
    try {
      return this.client.nFLGame.findMany();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getAllPlayerStats(): Promise<PlayerGameStats[]> {
    try {
      return this.client.playerGameStats.findMany();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getGamesInProgress(): Promise<NFLGame[]> {
    try {
      const games = this.client.nFLGame.findMany({
        where: { status: 'InProgress' },
      });

      return games;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async getCompletedGames(): Promise<NFLGame[]> {
    try {
      const games = this.client.nFLGame.findMany({
        where: { status: 'Final' },
      });

      return games;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /*********** HELPER METHODS *************/

  public async externalToInternalPlayer(external_id: number) {
    try {
      const player = await this.client.player.findFirstOrThrow({
        where: {
          external_id: external_id,
        },
      });

      return player.id;
    } catch (e) {
      // console.log(e, external_id);
      return null;
    }
  }

  public async externalToInternalNFLTeam(external_id: number) {
    try {
      const team = await this.client.nFLTeam.findFirstOrThrow({
        where: {
          external_id: external_id,
        },
      });

      return team.id;
    } catch (e) {
      // console.log(e, external_id);
      return null;
    }
  }

  public async externalToInternalNFLGame(external_id: number) {
    try {
      const game = await this.client.nFLGame.findFirstOrThrow({
        where: {
          external_id: external_id,
        },
      });

      return game.id;
    } catch (e) {
      // console.log(e, external_id);
      return null;
    }
  }
}

export default DatabaseGetterService;
