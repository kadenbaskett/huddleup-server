import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import DatabaseController from '@controllers/database.controller';

class DatabaseRoute implements Routes {
  public path = '/database';
  public router = Router();
  public controller = new DatabaseController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/leagues/create`, this.controller.createLeague);
  }
}

export default DatabaseRoute;
