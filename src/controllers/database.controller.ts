import DatabaseService from '@services/database.service';
import TransactionService from '@services/transaction.service';
import { calculateFantasyPoints } from '@/services/general.service';
import { Request, Response } from 'express';
import { RosterPlayer, Transaction } from '@prisma/client';


class DatabaseController {

  public databaseService: DatabaseService;
  public transactionService: TransactionService;

  constructor()
  {
      this.databaseService = new DatabaseService();
      this.transactionService = new TransactionService();
  }

  public empty = async (req: Request, res: Response): Promise<void> => {
      res.sendStatus(200);
  };

  // **************** SETTERS & UPDATERS ********************** //

  public createLeague = async (req: Request, res: Response): Promise<void> => {

    const{ leagueName, numTeams, minPlayers, maxPlayers, leagueDescription, publicJoin, scoring, commissionerId } = req.body;

    // create league settings
    const settings = await this.databaseService.createLeagueSettings(numTeams, publicJoin, minPlayers, maxPlayers, scoring );

    const league = await this.databaseService.createLeague(commissionerId, leagueName, leagueDescription, settings );

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
  public transactionAction = async (req: Request, res: Response): Promise<void> => {
    const { action, transactionId, userId } = req.body;

    const success = await this.transactionService.executeTransactionAction(action, transactionId, userId);

    if(success)
      res.sendStatus(200);
    else
      res.sendStatus(400);
  };

  public addPlayer = async (req: Request, res: Response): Promise<void> => {
      const addPlayerId = req.body.addPlayerId;
      const addPlayerExternalId = req.body.addPlayerExternalId;
      const rosterId = req.body.rosterId;
      const teamId = req.body.teamId;
      const userId = req.body.userId;
      const week = req.body.week;

      const t: Transaction = await this.databaseService.proposeAddPlayer(addPlayerId, addPlayerExternalId, rosterId, teamId, userId, week);

      t ? res.status(200).json(t) : res.sendStatus(400);
  };


  public editLineup = async (req: Request, res: Response): Promise<void> => {
      const rosterPlayerId = req.body.rosterPlayerId;
      const newPosition = req.body.newPosition;

      const rp: RosterPlayer = await this.databaseService.editLineup(rosterPlayerId, newPosition);

      rp ? res.status(200).json(rp) : res.sendStatus(400);
  };


  public proposeTrade = async (req: Request, res: Response): Promise<void> => {
      const sendPlayerIds = req.body.sendPlayerIds;
      const recPlayerIds = req.body.recPlayerIds;
      const proposeRosterId = req.body.proposeRosterId;
      const relatedRosterId = req.body.relatedRosterId;
      const proposeTeamId = req.body.proposeTeamId;
      const relatedTeamId = req.body.relatedTeamId;
      const userId = req.body.userId;
      const week = req.body.week;

      const transaction: Transaction = await this.databaseService.proposeTrade(sendPlayerIds, recPlayerIds, proposeRosterId, relatedRosterId, proposeTeamId, relatedTeamId, userId, week);

      transaction ? res.status(200).json(transaction) : res.sendStatus(400);
  };


  public addDropPlayer = async (req: Request, res: Response): Promise<void> => {
      const addPlayerId = req.body.addPlayerId;
      const addPlayerExternalId = req.body.addPlayerExternalId;
      const dropPlayerIds = req.body.dropPlayerIds;
      const rosterId = req.body.rosterId;
      const teamId = req.body.teamId;
      const userId = req.body.userId;
      const week = req.body.week;

      const transaction: Transaction = await this.databaseService.proposeAddDropPlayer(addPlayerId, addPlayerExternalId, dropPlayerIds, rosterId, teamId, userId, week);

      transaction ? res.status(200).json(transaction) : res.sendStatus(400);
  };

  public dropPlayer = async (req: Request, res: Response): Promise<void> => {
      const dropPlayerId = req.body.playerId;
      const rosterId = req.body.rosterId;
      const teamId = req.body.teamId;
      const userId = req.body.userId;
      const week = req.body.week;

      const transaction: Transaction = await this.databaseService.proposeDropPlayer(dropPlayerId, rosterId, teamId, userId, week);

      transaction ? res.status(200).json(transaction) : res.sendStatus(400);
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

      // const stats = {
      //   ...league,
      //   league: league.teams.map((t) => {
      //     return t.rosters.map((r) => {
      //       return r.players.map((p) => {
      //         return p.player.player_game_stats.map((game) => {
      //           return {
      //             ...game,
      //             points: calculateFantasyPoints(game),
      //           };
      //         });
      //       });
      //     });
      //   }),
      // };

      league ? res.status(200).json(league) : res.sendStatus(400);
  };

  public getUserTeams = async (req: Request, res: Response): Promise<void> => {
      const userId = Number(req.params.userId);
      const teams = await this.databaseService.getUserTeams(userId);

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

  public getNews = async (req: Request, res: Response): Promise<void> => {
    const amountOfNews = Number(req.params.amount);
    const news = await this.databaseService.getNews(amountOfNews);

    if(news)
    {
      //convert news content from buffer back to string
      const convertedNews = news.map(x => {
        return {
          id: x.id,
          external_id: x.external_id,
          updated_date: x.updated_date,
          time_posted: x.time_posted,
          title: x.title,
          content: x.content.toString('utf8'),
          external_player_id: x.external_player_id,
          external_team_id: x.external_team_id,
          source: x.source,
          source_url: x.source_url,
      };
    });
      res.status(200).json(convertedNews);
    }
    else
    {
      res.sendStatus(400);
    }
};
}

export default DatabaseController;
