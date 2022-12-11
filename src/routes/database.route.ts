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
    this.router.get(`${this.path}/players/:playerId(\\d+)`, this.controller.getIndividualPlayerDetails);
    this.router.get(`${this.path}/players/stats`, this.controller.getAllPlayersStats);
    this.router.get(`${this.path}/players/league/:leagueId(\\d+)`, this.controller.getLeaguePlayers);
    this.router.get(`${this.path}/players/stats/:playerId(\\d+)`, this.controller.getIndividualPlayerStats);
    // this.router.get(`${this.path}/players/stats/current/:playerId(\\d+)`, this.controller.getCurrentPlayerStats);

    this.router.get(`${this.path}/leagues/user/:userId(\\d+)`, this.controller.getUserLeagues);
    this.router.get(`${this.path}/leagues/public`, this.controller.getPublicLeagues);
    this.router.get(`${this.path}/league/:leagueId(\\d+)`, this.controller.getLeagueInfo);

    this.router.get(`${this.path}/teams/user/:userId(\\d+)`, this.controller.getUserTeams);
    this.router.get(`${this.path}/teams/currentroster/:teamId(\\d+)`, this.controller.getCurrentTeamRoster);
    this.router.get(`${this.path}/teams/roster/:teamId(\\d+)/:week`, this.controller.getTeamRoster);
  }
}

export default DatabaseRoute;
