import { Request, Response } from 'express';
import DatabaseService from '@services/database.service';


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
      const league = await this.databaseService.createLeague();

      if(league)
      {
        res.sendStatus(200);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  // **************** GETTERS ********************** //

  public getNFLTeams = async (req: Request, res: Response): Promise<void> => {
      const teams = await this.databaseService.getNFLTeams();

      if(teams)
      {
        res.status(200).json(teams);
      }
      else
      {
        res.sendStatus(400);
      }
  };


  public getAllPlayersDetails = async (req: Request, res: Response): Promise<void> => {
      const players = await this.databaseService.getAllPlayersDetails();

      if(players)
      {
        res.status(200).json(players);
      }
      else
      {
        res.sendStatus(400);
      }
  };


  public getAllPlayersStats = async (req: Request, res: Response): Promise<void> => {
      const players = await this.databaseService.getAllPlayersStats();
      console.log(players);

      if(players)
      {
        res.status(200).json(players);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getIndividualPlayerDetails = async (req: Request, res: Response): Promise<void> => {
      const playerID = Number(req.params.playerId);
      const player = await this.databaseService.getPlayerDetails(playerID);

      if(player)
      {
        res.status(200).json(player);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getIndividualPlayerStats = async (req: Request, res: Response): Promise<void> => {
      const playerID = Number(req.params.playerId);
      console.log(playerID);
      const player = await this.databaseService.getPlayerGameLogs(playerID);

      if(player)
      {
        res.status(200).json(player);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getNFLTeamGames = async (req: Request, res: Response): Promise<void> => {
      const teamID = Number(req.params.teamID);
      const games = await this.databaseService.getNFLTeamGames(teamID);

      if(games)
      {
        res.status(200).json(games);
      }
      else
      {
        res.sendStatus(400);
      }
  };


}

export default DatabaseController;