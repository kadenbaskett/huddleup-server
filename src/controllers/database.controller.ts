import { Request, Response } from 'express';
import DatabaseService from '@services/database.service';
import { calculateFantasyPoints } from '@/services/general.service';


class DatabaseController {

  public databaseService: DatabaseService;

  constructor()
  {
      this.databaseService = new DatabaseService();
  }

  public empty = async (req: Request, res: Response): Promise<void> => {
      res.sendStatus(200);
  };


  // **************** SETTERS & UPDATERS ********************** //

  public createLeague = async (req: Request, res: Response): Promise<void> => {
      const league = await this.databaseService.createLeague(0, 'name');

      league ? res.sendStatus(200) : res.sendStatus(400);
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
      const username = req.body.username;
      const email = req.body.email;

      const validationMessage = await this.databaseService.validateNewUser(email, username);
      
      if(validationMessage == null){
        const user = await this.databaseService.createUser(username, email);

        user ? res.status(200).json(user) : res.sendStatus(500);
      }
      else{
        res.status(400).send(validationMessage);
      }
  };

  public addDropPlayer = async (req: Request, res: Response): Promise<void> => {
      const addPlayerId = req.body.addPlayerId;
      const dropPlayerIds = req.body.dropPlayerIds;
      const rosterId = req.body.rosterId;

      const roster = await this.databaseService.addDropPlayer(addPlayerId, dropPlayerIds[0], rosterId);

      for(const id of dropPlayerIds.slice(1))
      {
        await this.databaseService.dropPlayer(id, rosterId); 
      }

      roster ? res.status(200).json(roster) : res.sendStatus(400);
  };

  // **************** GETTERS ********************** //

  public getUser = async (req: Request, res: Response): Promise<void> => {
      const email = req.params.email;
      const user = await this.databaseService.getUser(email);

      user ? res.status(200).json(user) : res.sendStatus(400);
  };

  public getNFLTeams = async (req: Request, res: Response): Promise<void> => {
      const teams = await this.databaseService.getNFLTeams();

      teams ? res.status(200).json(teams) : res.sendStatus(400);
  };


  public getAllPlayersDetails = async (req: Request, res: Response): Promise<void> => {
      const players = await this.databaseService.getAllPlayersDetails();

      players ? res.status(200).json(players) : res.sendStatus(400);
  };

  public getTimeframe = async (req: Request, res: Response): Promise<void> => {
      const timeframe = await this.databaseService.getTimeframe();

      timeframe ? res.status(200).json(timeframe) : res.sendStatus(400);
  };

  public getAllPlayersStats = async (req: Request, res: Response): Promise<void> => {
      const players = await this.databaseService.getAllPlayersStats();
      const stats = players.map((p) => {
        return {
          ...p,
          points: calculateFantasyPoints(p),
        };
      });

      stats ? res.status(200).json(stats) : res.sendStatus(400);
  };

  public getIndividualPlayerDetails = async (req: Request, res: Response): Promise<void> => {
      const playerID = Number(req.params.playerId);
      const player = await this.databaseService.getPlayerDetails(playerID);

      player ? res.status(200).json(player) : res.sendStatus(400);
  };


  public getIndividualPlayerStats = async (req: Request, res: Response): Promise<void> => {
      const playerID = Number(req.params.playerId);
      const gameLogs = await this.databaseService.getPlayerGameLogs(playerID);
      const stats = gameLogs.map((game) => {
        return {
          ...game,
          points: calculateFantasyPoints(game),
        };
      });

      stats ? res.status(200).json(stats) : res.sendStatus(400);
  };


  public getUserLeagues = async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.userId);
      const leagues = await this.databaseService.getUserLeagues(userId);

      leagues ? res.status(200).json(leagues) : res.sendStatus(400);
  };


  public getLeagueInfo = async (req: Request, res: Response): Promise<void> => {
      const leagueId = Number(req.params.leagueId);
      const league = await this.databaseService.getLeagueInfo(leagueId);

      league ? res.status(200).json(league) : res.sendStatus(400);
  };


  public getUserTeams = async (req: Request, res: Response): Promise<void> => {
      const teamId = Number(req.params.teamId);
      const teams = await this.databaseService.getUserTeams(teamId);

      teams ? res.status(200).json(teams) : res.sendStatus(400);
  };

  public getCurrentTeamRoster = async (req: Request, res: Response): Promise<void> => {
      const teamId = Number(req.params.teamId);
      const roster = await this.databaseService.getCurrentTeamRoster(teamId);

      roster ? res.status(200).json(roster) : res.sendStatus(400);
  };

  public getLeaguePlayers = async (req: Request, res: Response): Promise<void> => {
      const leagueId = Number(req.params.leagueId);
      const players = await this.databaseService.getLeaguePlayers(leagueId);

      players ? res.status(200).json(players) : res.sendStatus(400);
  };

  public getTeamRoster = async (req: Request, res: Response): Promise<void> => {
      const teamId = Number(req.params.teamId);
      const week = Number(req.params.week);
      const roster = await this.databaseService.getTeamRoster(teamId, week);

      roster ? res.status(200).json(roster) : res.sendStatus(400);
  };


  public getPublicLeagues = async (req: Request, res: Response): Promise<void> => {
      const leagues = await this.databaseService.getPublicLeagues();

      leagues ? res.status(200).json(leagues) : res.sendStatus(400);
  };


  public getNFLTeamGames = async (req: Request, res: Response): Promise<void> => {
      const teamID = Number(req.params.teamID);
      const games = await this.databaseService.getNFLTeamGames(teamID);

      games ? res.status(200).json(games) : res.sendStatus(400);
  };

}

export default DatabaseController;