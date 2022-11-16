import { Request, Response } from 'express';
import statsService from '@services/stats.service';
import { respObj } from '@interfaces/respobj.interface';


class StatssController {
  public statsService = new statsService();

  public getNFLTeams = async (req: Request, res: Response): Promise<void> => {
      const response: respObj = await this.statsService.getNFLTeams();

      if(response.data)
      {
        res.status(200).json(response.data);
      }
      else
      {
        res.status(400).json(response.error);
      }
  };

  public getTopPlayersByADP = async (req: Request, res: Response): Promise<void> => {
      const response: respObj = await this.statsService.getTopFantasyPlayersByADP();
      // console.log(response);

      if(response.data)
      {
        res.status(200).json(response.data);
      }
      else
      {
        res.status(400).json(response.error);
      }
  };

  public getAllPlayersDetails = async (req: Request, res: Response): Promise<void> => {
      const response: respObj = await this.statsService.getAllPlayersDetails();

      if(response.data)
      {
        res.status(200).json(response.data);
      }
      else
      {
        res.status(400).json(response.error);
      }
  };

  public getIndividualPlayerDatails = async (req: Request, res: Response): Promise<void> => {
      const playerID = Number(req.params.playerID);
      const response: respObj = await this.statsService.getPlayerDetails(playerID);

      if(response.data)
      {
        res.status(200).json(response.data);
      }
      else
      {
        res.status(400).json(response.error);
      }
  };

}

export default StatssController;
