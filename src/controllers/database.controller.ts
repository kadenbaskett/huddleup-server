import { Request, Response } from 'express';
import databaseService from '@services/database.service';


class DatabaseController {

  public service: databaseService;

  constructor()
  {
      this.service = new databaseService();
  }

  public empty = async (req: Request, res: Response): Promise<void> => {
      res.sendStatus(200);
  };

  public createLeague = async (req: Request, res: Response): Promise<void> => {
      const league = await this.service.createLeague();

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
      const teams = await this.service.getTeamsInLeague(leagueId);

      if(teams)
      {
        res.status(200).json(teams);
      }
      else
      {
        res.sendStatus(400);
      }
  };


}

export default DatabaseController;