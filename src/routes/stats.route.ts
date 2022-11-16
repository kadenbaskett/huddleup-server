import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import StatsController from '@controllers/stats.controller';

class StatsRoute implements Routes {
  public path = '/stats';
  public router = Router();
  public statsController = new StatsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/teams`, this.statsController.getNFLTeams);
    // this.router.get(`${this.path}/:id(\\d+)`, this.usersController.getUserById);
  }
}

export default StatsRoute;
