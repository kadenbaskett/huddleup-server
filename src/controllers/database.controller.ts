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

      if(league)
      {
        res.sendStatus(200);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
      const username = req.body.username;
      const email = req.body.email;

      const validationMessage = await this.databaseService.validateNewUser(email, username);
      
      if(validationMessage == null){
        const user = await this.databaseService.createUser(username, email);
        if(user)
        {
          res.status(200).json(user);
        }
        else
        {
          res.sendStatus(500);
        }
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

      if(user)
      {
        res.status(200).json(user);
      }
      else
      {
        res.sendStatus(400);
      }
  };

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

  public getTimeframe = async (req: Request, res: Response): Promise<void> => {
      const timeframe = await this.databaseService.getTimeframe();

      if(timeframe)
      {
        res.status(200).json(timeframe);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getAllPlayersStats = async (req: Request, res: Response): Promise<void> => {
      const players = await this.databaseService.getAllPlayersStats();
      const stats = players.map((p) => {
        return {
          ...p,
          points: calculateFantasyPoints(p),
        };
      });

      if(stats)
      {
        res.status(200).json(stats);
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
      const gameLogs = await this.databaseService.getPlayerGameLogs(playerID);
      const stats = gameLogs.map((game) => {
        return {
          ...game,
          points: calculateFantasyPoints(game),
        };
      });

      if(stats)
      {
        res.status(200).json(stats);
      }
      else
      {
        res.sendStatus(400);
      }
  };


  public getUserLeagues = async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.userId);
      const leagues = await this.databaseService.getUserLeagues(userId);

      if(leagues)
      {
        res.status(200).json(leagues);
      }
      else
      {
        res.sendStatus(400);
      }
  };


  public getLeagueInfo = async (req: Request, res: Response): Promise<void> => {
      const leagueId = Number(req.params.leagueId);
      const league = await this.databaseService.getLeagueInfo(leagueId);

      if(league)
      {
        res.status(200).json(league);
      }
      else
      {
        res.sendStatus(400);
      }
  };


  public getUserTeams = async (req: Request, res: Response): Promise<void> => {
      const teamId = Number(req.params.teamId);
      const teams = await this.databaseService.getUserTeams(teamId);

      if(teams)
      {
        res.status(200).json(teams);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getCurrentTeamRoster = async (req: Request, res: Response): Promise<void> => {
      const teamId = Number(req.params.teamId);
      const roster = await this.databaseService.getCurrentTeamRoster(teamId);

      if(roster)
      {
        res.status(200).json(roster);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getLeaguePlayers = async (req: Request, res: Response): Promise<void> => {
      const leagueId = Number(req.params.leagueId);
      const players = await this.databaseService.getLeaguePlayers(leagueId);

      if(players)
      {
        res.status(200).json(players);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public getTeamRoster = async (req: Request, res: Response): Promise<void> => {
      const teamId = Number(req.params.teamId);
      const week = Number(req.params.week);
      const roster = await this.databaseService.getTeamRoster(teamId, week);

      if(roster)
      {
        res.status(200).json(roster);
      }
      else
      {
        res.sendStatus(400);
      }
  };


  public getPublicLeagues = async (req: Request, res: Response): Promise<void> => {
      const leagues = await this.databaseService.getPublicLeagues();

      if(leagues)
      {
        res.status(200).json(leagues);
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