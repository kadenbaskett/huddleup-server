import { Request, Response } from 'express';
import DatabaseService from '@services/database.service';
import StatsService from '@/services/stats.service';


class DatabaseController {

  public databaseService: DatabaseService;
  private statsService: StatsService;

  constructor()
  {
      this.databaseService = new DatabaseService();

      this.statsService = new StatsService();
  }

  public empty = async (req: Request, res: Response): Promise<void> => {
      res.sendStatus(200);
  };

  public createLeague = async (req: Request, res: Response): Promise<void> => {
      const league = await this.databaseService.createLeague();

      if(league)
      {
        res.sendStatus(200);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getTeamsInLeague = async (req: Request, res: Response): Promise<void> => {
      const leagueId = Number(req.params.leagueId);
      const teams = await this.databaseService.getTeamsInLeague(leagueId);

      if(teams)
      {
        res.status(200).json(teams);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getLeaguePlayers = async (req: Request, res: Response): Promise<void> => {
      const leagueId = Number(req.params.leagueId);
      const leaguePlayers = await this.databaseService.getLeaguePlayers(leagueId);
      const topPlayers = await this.statsService.getTopFantasyPlayersByADP();
      const players = [];


      if(players)
      {
        res.status(200).json(players);
      }
      else
      {
        res.sendStatus(400);
      }
  };


}

export default DatabaseController;