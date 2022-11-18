import { Request, Response } from 'express';
import databaseService from '@services/database.service';


class DatabaseController {
  public service = new databaseService();

  public createLeague = async (req: Request, res: Response): Promise<void> => {
      await this.service.createLeague();
      await this.service.getLeagues();
    
      res.status(200);
  };

}

export default DatabaseController;