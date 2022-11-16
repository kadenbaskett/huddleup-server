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
    this.router.get(`${this.path}/players/topfantasy`, this.statsController.getTopPlayersByADP);
    this.router.get(`${this.path}/players/details`, this.statsController.getAllPlayersDetails);
    this.router.get(`${this.path}/player/details/:playerID(\\d+)`, this.statsController.getIndividualPlayerDatails);
  }
}

export default StatsRoute;
