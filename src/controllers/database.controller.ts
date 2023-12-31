import DatabaseService from '@services/database.service';
import TransactionService from '@services/transaction.service';
import { calculateFantasyPoints, getUniquePortForDraft } from '@/services/general.service';
import { Request, Response } from 'express';
import { Roster, RosterPlayer, Team, Timeframe, Transaction } from '@prisma/client';
import randomstring from 'randomstring';
import { TransactionWithPlayers } from '@/interfaces/prisma.interface';
import Seed from '@/datasink/seed';
import { DRAFT, SEASON } from '@/config/huddleup_config';


class DatabaseController {

  public databaseService: DatabaseService;
  public transactionService: TransactionService;
  public seed: Seed;

  constructor()
  {
      this.databaseService = new DatabaseService();
      this.transactionService = new TransactionService();
      this.seed = new Seed();
  }

  public empty = async (req: Request, res: Response): Promise<void> => {
      res.sendStatus(200);
  };

  // **************** SETTERS & UPDATERS ********************** //

  public createLeague = async (req: Request, res: Response): Promise<void> => {

    const{ leagueName, numTeams, minPlayers, maxPlayers, leagueDescription, publicJoin, scoring, commissionerId, date, draftTime } = req.body;

    // create league settings
    const draftDate: Date = new Date(date + ' ' + draftTime);
    const settings = await this.databaseService.createLeagueSettings(numTeams, publicJoin, minPlayers, maxPlayers, scoring, draftDate);
    const token = await randomstring.generate(7);
    const league = await this.databaseService.createLeague(commissionerId, leagueName, leagueDescription, settings, token);

    league ? res.status(201).json(league) : res.sendStatus(400);
  };

  public fillLeague = async(req: Request, res: Response): Promise<void> => {
    const { leagueId } = req.body;
    try {
      await this.seed.fillLeagueRandomUsers(leagueId);
      await this.setDraftDate(leagueId);
      res.sendStatus(200);
    }
    catch(e)
    {
      console.log(e);
      res.sendStatus(400);
    }
  };

  // We should not need this anymore
  // public startDraft = async(req?: Request, res?: Response): Promise<void> => {
  //   const { leagueId } = req.body;

  //   try
  //   {
  //     startDraftChildProcess(leagueId, port);
  //     res.sendStatus(200);
  //   }
  //   catch(e)
  //   {
  //     console.log(e);
  //     res.sendStatus(400);
  //   }
  // };

  public getDraftPort = async(req?: Request, res?: Response): Promise<void> => {
    try {
      const { leagueId } = req.params;
      const port = getUniquePortForDraft(Number(leagueId));
      res.status(200).json(port);
    } catch (e) {
      res.sendStatus(400);
    }
  };


  // THIS SHOULD EVENTUALLY BE DONE BY THE UI
  // COMISH SHOULD SET DRAFT ORDER AND DRAFT TIME BEFORE DRAFT IS LAUNCHED
  // async setDraftDateAndOrder(leagueId)
  // {
  //     const secondsBeforeStart = 120;
  //     const now = new Date();
  //     now.setSeconds(now.getSeconds() + secondsBeforeStart);
  //     await this.databaseService.setDraftDate(now, leagueId);
  //     await this.databaseService.setRandomDraftOrder(leagueId);
  // }

  public async setDraftDate(leagueId)
  {
      const now = new Date();
      now.setMilliseconds(now.getMilliseconds() + DRAFT.TIME_BEFORE_DRAFT_START_MS);
      await this.databaseService.setDraftDate(now, leagueId);
  }



  public createUser = async (req: Request, res: Response): Promise<void> => {
      const username = req.body.username;
      const email = req.body.email;

      const validationMessage = await this.databaseService.validateNewUser(email, username);

      if(validationMessage == null){
        const user = await this.databaseService.createUser(username, email);

        user ? res.status(201).json(user) : res.sendStatus(500);
      }
      else{
        res.status(400).send(validationMessage);
      }
  };

  public createTeam = async (req: Request, res: Response): Promise<void> => {

    const{ leagueId, teamName, teamOwnerId } = req.body;

    // We haven't talked through this yet but this will need to happen at some point
    // I think we should do the same as league settings by giving the team default values at first and having them change it if they want
    const settings = await this.databaseService.createTeamSettings();

    const token = randomstring.generate(7);
    const team: Team = await this.databaseService.createTeam(leagueId, teamName, teamOwnerId, settings.id, token);
    // passing 1 here because when a user creates a team this user is the owner/captain
    const userToTeam = await this.databaseService.userToTeam(team.id, teamOwnerId, 1);

    team && userToTeam ? res.status(201).json(team) : res.sendStatus(400);
  };

  public deleteTeam = async (req: Request, res: Response): Promise<void> => {
    const{ managers, id, league_id } = req.body;

    managers.forEach(async (manager) => await this.databaseService.removeUserFromTeam(manager.team_id, manager.user_id));
    const removedTeam = await this.databaseService.deleteTeam(id, league_id);
    removedTeam ? res.sendStatus(200) : res.sendStatus(400);
  };

  public userToTeam = async (req: Request, res: Response) : Promise<void> => {
    const{ user, team } = req.body;

    const userToTeam = await this.databaseService.userToTeam(team.id, user.userInfo.id, 0);

    userToTeam ? res.status(200).json(userToTeam) : res.sendStatus(400);
  };

  public removeUserFromTeam = async (req: Request, res: Response) : Promise<void> => {
    const{ user, userTeam } = req.body;
    const removed = await this.databaseService.removeUserFromTeam(userTeam.id, user.user_id);

    removed ? res.sendStatus(200) : res.sendStatus(400);
  };


  public transactionAction = async (req: Request, res: Response): Promise<void> => {
    const { action, transactionId, userId } = req.body;

    const success = await this.transactionService.executeTransactionAction(action, transactionId, userId);
    if(success)
      res.sendStatus(200);
    else
      res.sendStatus(400);
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

      let duplicate = false;

      //check if a Trade of this type already exists
      let transactions: TransactionWithPlayers[] = await this.databaseService.getTeamPendingTransactions(proposeTeamId);
      transactions = transactions.filter((transaction) => transaction.type === 'Trade');

      transactions.forEach((transaction) =>
      {

        const addPlayers = transaction.players.filter((player) =>
            player.joins_proposing_team === true,
          ).map((transaction) => transaction.player_id);


          const droppingPlayers = transaction.players.filter((player) =>
          player.joins_proposing_team === false,
        ).map((transaction) => transaction.player_id);


        sendPlayerIds.forEach((sendPlayerId) =>
        {
          if(droppingPlayers.includes(sendPlayerId))
          {
            const index = droppingPlayers.indexOf(sendPlayerId);
            if(index > -1)
            {
              droppingPlayers.splice(index, 1);
            }
          }
        });


        recPlayerIds.forEach((recPlayerId) =>
        {
          if(addPlayers.includes(recPlayerId))
          {
            const index = addPlayers.indexOf(recPlayerId);
            if(index > -1)
            {
              addPlayers.splice(index, 1);
            }
          }
        });


        if(droppingPlayers.length === 0 && addPlayers.length == 0)
        {
          duplicate = true;
        }

      });


      if(!duplicate)
      {
        const transaction: Transaction = await this.databaseService.proposeTrade(sendPlayerIds, recPlayerIds, proposeRosterId, relatedRosterId, proposeTeamId, relatedTeamId, userId, week);
        transaction ? res.status(200).json(transaction) : res.sendStatus(400);
      }
      else
      {
        res.sendStatus(400);
      }
  };

  public addPlayer = async (req: Request, res: Response): Promise<void> => {
    const addPlayerId = req.body.addPlayerId;
    const addPlayerExternalId = req.body.addPlayerExternalId;
    const rosterId = req.body.rosterId;
    const teamId = req.body.teamId;
    const userId = req.body.userId;
    const week = req.body.week;
    let duplicate = false;


    let transactions: TransactionWithPlayers[] = await this.databaseService.getTeamPendingTransactions(teamId);
    transactions = transactions.filter((transaction) => transaction.type === 'Add');


    transactions.forEach((transaction) =>
    {
      const addPlayer = transaction.players.find((player) =>
      player.joins_proposing_team === true,
      ).player_id;

      if(addPlayer === addPlayerId)
      {
        duplicate = true;
      }

    });


    if(!duplicate)
    {
      const rp: RosterPlayer = await this.databaseService.proposeAddPlayer(addPlayerId, addPlayerExternalId, rosterId, teamId, userId, week);
      rp ? res.status(200).json(rp) : res.sendStatus(400);
    }
    else
    {
      res.sendStatus(400);
    }
};


  public addDropPlayer = async (req: Request, res: Response): Promise<void> => {
      const addPlayerId = req.body.addPlayerId;
      const addPlayerExternalId = req.body.addPlayerExternalId;
      const dropPlayerIds = req.body.dropPlayerIds;
      const rosterId = req.body.rosterId;
      const teamId = req.body.teamId;
      const userId = req.body.userId;
      const week = req.body.week;

      let duplicate = false;

      //check if a addDrop of this type already exists
      let transactions: TransactionWithPlayers[] = await this.databaseService.getTeamPendingTransactions(teamId);
      transactions = transactions.filter((transaction) => transaction.type === 'AddDrop');

      transactions.forEach((transaction)=> {

        const addPlayer = transaction.players.find((player) =>
          player.joins_proposing_team === true,
        ).player_id;


        const droppingPlayers = transaction.players.filter((player) =>
          player.joins_proposing_team === false,
        ).map((transaction) => transaction.player_id);

        if(addPlayer === addPlayerId)
        {

          dropPlayerIds.forEach((dropId) => {

            if(droppingPlayers.includes(dropId))
            {
              const index = droppingPlayers.indexOf(dropId);
              if(index > -1)
              {
                droppingPlayers.splice(index, 1);
              }
            }
          });

          //if this is 0 then a copy of this addDrop exists
          if(droppingPlayers.length === 0)
          {
           duplicate = true;
          }
        }
      });

      if(!duplicate)
      {
        const roster: Roster = await this.databaseService.proposeAddDropPlayer(addPlayerId, addPlayerExternalId, dropPlayerIds, rosterId, teamId, userId, week);
        roster ? res.status(200).json(roster) : res.sendStatus(400);
      }
      else
      {
        res.sendStatus(400);
      }


  };

  public dropPlayer = async (req: Request, res: Response): Promise<void> => {
      const dropPlayerId = req.body.playerId;
      const rosterId = req.body.rosterId;
      const teamId = req.body.teamId;
      const userId = req.body.userId;
      const week = req.body.week;

      let duplicate = false;

      //check if a addDrop of this type already exists
      let transactions: TransactionWithPlayers[] = await this.databaseService.getTeamPendingTransactions(teamId);
      transactions = transactions.filter((transaction) => transaction.type === 'Drop');

      transactions.forEach((transaction)=> {

        const dropPlayer = transaction.players.find((player) =>
          player.joins_proposing_team === false,
        ).player_id;

        if(dropPlayer === dropPlayerId)
        {
          duplicate = true;
        }
      });

      if(!duplicate)
      {
        const created = await this.databaseService.proposeDropPlayer(dropPlayerId, rosterId, teamId, userId, week);
        created ? res.sendStatus(200) : res.sendStatus(400);
      }
      else
      {
        res.sendStatus(400);
      }
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

  public advanceWeek = async (req: Request, res: Response): Promise<void> => {
      let week = Number(req.body.week);
      console.log(week);

      if(week === SEASON.NFL_FINAL_WEEK)
      {
        await this.databaseService.clearLeagueStuff();
        res.sendStatus(200);
      }
      else {
        const timeframe: Timeframe = await this.databaseService.getTimeframe();
        const nextWeek = Math.min(SEASON.FINAL_SEASON_WEEK, Number(timeframe.week + 1));
        week = week ? week : nextWeek;
        await this.seed.simulateWeek(week);
        res.sendStatus(200);
      }
  };


  public resetToWeekOne = async (req: Request, res: Response): Promise<void> => {
      await this.seed.simulateTimeframe(1);
      res.sendStatus(200);
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

  public getPrivateLeagues = async (req: Request, res: Response): Promise<void> => {
    const leagues = await this.databaseService.getPrivateLeagues();

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
