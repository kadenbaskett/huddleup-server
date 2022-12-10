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

    //************* POST ROUTES  **************/
    this.router.post(`${this.path}/league`, this.controller.createLeague);


    //************* GET ROUTES  **************/
    this.router.get(`${this.path}/players`, this.controller.getAllPlayersDetails);
    this.router.get(`${this.path}/players/stats`, this.controller.getAllPlayersStats);
    this.router.get(`${this.path}/players/stats/:playerId(\\d+)`, this.controller.getIndividualPlayerStats);

    this.router.get(`${this.path}/user/leagues/:userId(\\d+)`, this.controller.getUserLeagues);
    this.router.get(`${this.path}/leagues/public`, this.controller.getPublicLeagues);

    //************* UNIMPLEMENTED  **************/
    this.router.get(`${this.path}/leagues/teams/:leagueId(\\d+)`, this.controller.empty);
    this.router.get(`${this.path}/leagues/settings/:leagueId(\\d+)`, this.controller.empty);
    this.router.get(`${this.path}/leagues/standings/:leagueId(\\d+)`, this.controller.empty);
    this.router.get(`${this.path}/leagues/schedule/:leagueId(\\d+)`, this.controller.empty);
    this.router.get(`${this.path}/league/players/:leageId(\\d+)`, this.controller.empty);

    this.router.get(`${this.path}/teams/details/:teamId(\\d+)`, this.controller.empty);
    this.router.get(`${this.path}/teams/settings/:teamId(\\d+)`, this.controller.empty);
    this.router.get(`${this.path}/teams/roster/:weekNumber(\\d+)/:teamId(\\d+)`, this.controller.empty);
    this.router.get(`${this.path}/teams/schedule/:teamId(\\d+)`, this.controller.empty);
    this.router.get(`${this.path}/teams/pendingmoves/:teamId(\\d+)`, this.controller.empty);

    this.router.post(`${this.path}/teams/waivers/:teamId(\\d+)`, this.controller.empty);
    this.router.post(`${this.path}/teams/trades/:teamId(\\d+)`, this.controller.empty);

    this.router.get(`${this.path}/user/teams/:userId(\\d+)`, this.controller.empty);

  }
}

export default DatabaseRoute;
