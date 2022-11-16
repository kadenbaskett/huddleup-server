import { NextFunction, Request, Response } from 'express';
import statsService from '@services/stats.service';
import { respObj } from '@interfaces/respobj.interface';


class StatssController {
  public statsService = new statsService();

  public getNFLTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
}

export default StatssController;
