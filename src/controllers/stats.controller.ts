import { NextFunction, Request, Response } from 'express';
import statsService from '@services/stats.service';

class StatssController {
  public statsService = new statsService();

  public getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: string = await this.statsService.getStats();

      res.status(200).json({ data: data, message: 'getStats' });
    } catch (error) {
      next(error);
    }
  };
}

export default StatssController;
