import { Request, Response } from 'express';
import databaseService from '@services/database.service';


class DatabaseController {
  public service = new databaseService();

  public createLeague = async (req: Request, res: Response): Promise<void> => {
      await this.service.createLeague();
      await this.service.getLeagues();
    
      res.sendStatus(200);
  };

  public empty = async (req: Request, res: Response): Promise<void> => {
      res.sendStatus(200);
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