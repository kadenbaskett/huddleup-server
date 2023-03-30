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
    this.router.post(`${this.path}/user`, this.controller.createUser);
    this.router.post(`${this.path}/team`, this.controller.createTeam);
    this.router.post(`${this.path}/deleteTeam`, this.controller.deleteTeam);
    this.router.post(`${this.path}/userToTeam`, this.controller.userToTeam);
    this.router.post(`${this.path}/removeUserFromTeam`, this.controller.removeUserFromTeam);
    this.router.post(`${this.path}/roster/addDropPlayer`, this.controller.addDropPlayer);
    this.router.post(`${this.path}/roster/addPlayer`, this.controller.addPlayer);
    this.router.post(`${this.path}/roster/dropPlayer`, this.controller.dropPlayer);
    this.router.post(`${this.path}/roster/proposeTrade`, this.controller.proposeTrade);
    this.router.post(`${this.path}/roster/editLineup`, this.controller.editLineup);
    this.router.post(`${this.path}/transaction/action`, this.controller.transactionAction);
    this.router.post(`${this.path}/league/fill`, this.controller.fillLeague);
    this.router.post(`${this.path}/league/startDraft`, this.controller.startDraft);


    //************* GET ROUTES  **************/
    // TODO add regular expression for the email
    this.router.get(`${this.path}/user/:email`, this.controller.getUser);

    this.router.get(`${this.path}/players`, this.controller.getAllPlayersDetails);
    this.router.get(`${this.path}/players/:playerId(\\d+)`, this.controller.getIndividualPlayerDetails);
    this.router.get(`${this.path}/players/stats`, this.controller.getAllPlayersStats);
    this.router.get(`${this.path}/players/league/:leagueId(\\d+)`, this.controller.getLeaguePlayers);
    this.router.get(`${this.path}/players/stats/:playerId(\\d+)`, this.controller.getIndividualPlayerStats);

    this.router.get(`${this.path}/timeframe`, this.controller.getTimeframe);

    this.router.get(`${this.path}/news/:amount(\\d+)`, this.controller.getNews);

    this.router.get(`${this.path}/leagues/user/:userId(\\d+)`, this.controller.getUserLeagues);
    this.router.get(`${this.path}/leagues/public`, this.controller.getPublicLeagues);
    this.router.get(`${this.path}/leagues/private`, this.controller.getPrivateLeagues);
    this.router.get(`${this.path}/league/:leagueId(\\d+)`, this.controller.getLeagueInfo);

    this.router.get(`${this.path}/teams/user/:userId(\\d+)`, this.controller.getUserTeams);
    this.router.get(`${this.path}/teams/currentroster/:teamId(\\d+)`, this.controller.getCurrentTeamRoster);
    this.router.get(`${this.path}/teams/roster/:teamId(\\d+)/:week`, this.controller.getTeamRoster);
  }
}

export default DatabaseRoute;
