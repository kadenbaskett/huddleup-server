import { NFLGame, Player, Timeframe, News } from '@prisma/client';
import { respObj } from './interfaces/respobj.interface';
import DatasinkDatabaseService from '@services/datasink_database.service';
import StatsService from '@services/stats.service';

const hoursToMilliseconds = (hours) => {
  return hours * 60 * 60 * 1000;
};

// TODO create a config file
const config = {
  timeframe: hoursToMilliseconds(1),
  teams: hoursToMilliseconds(1),
  players: hoursToMilliseconds(1),
  schedule: hoursToMilliseconds(1),
  gamesInProgress: 60000, // Update once a minute
  news: 180000, // Update every 3 minutes
  projections: 300000, // Update every 5 minutes
  allowedPositions: [ 'QB', 'RB', 'WR', 'TE' ],
};

class DataSinkApp {
  stats: StatsService;
  db: DatasinkDatabaseService;

  constructor() {
    this.stats = new StatsService();
    this.db = new DatasinkDatabaseService();
  }

  startUpdateLoop() {
    setInterval(this.updateTimeframes.bind(this), config.timeframe);
    setInterval(this.updateTeams.bind(this), config.teams);
    setInterval(this.updatePlayers.bind(this), config.players);
    setInterval(this.updateSchedule.bind(this), config.schedule);
    setInterval(this.updateGameScoresAndPlayerStats.bind(this), config.gamesInProgress);
    setInterval(this.updateNews.bind(this), config.news);
    setInterval(this.updatePlayerProjections.bind(this), config.projections);
  }

  async printDatabase() {
    const timeframes = await this.db.getTimeframe();
    console.log('Timeframe: ', timeframes);
    const teams = await this.db.getNFLTeams();
    console.log('Teams: ', teams[0]);
    const schedule = await this.db.getAllNFLGames();
    console.log('Schedule: ', schedule[0]);
    const players = await this.db.getPlayers();
    console.log('Players: ', players[0]);
    const stats = await this.db.getAllPlayerStats();
    console.log('Stats: ', stats[0]);
    const news = await this.db.getNews();
    console.log('News: ', news[0]);
    const projections = await this.db.getAllPlayerProjections();
    console.log('Projections: ', projections[0]);
  }

  async clearDB() {
    console.log('Clearing the database before initial update');
    await this.db.client.transactionPlayer.deleteMany();
    await this.db.client.transactionAction.deleteMany();
    await this.db.client.transaction.deleteMany();
    await this.db.client.rosterPlayer.deleteMany();
    await this.db.client.roster.deleteMany();
    await this.db.client.userToTeam.deleteMany();
    await this.db.client.matchup.deleteMany();
    await this.db.client.team.deleteMany();
    await this.db.client.teamSettings.deleteMany();
    await this.db.client.league.deleteMany();
    await this.db.client.user.deleteMany();

    await this.db.client.timeframe.deleteMany();
    await this.db.client.playerGameStats.deleteMany();
    await this.db.client.playerProjections.deleteMany();
    await this.db.client.nFLGame.deleteMany();
    await this.db.client.player.deleteMany();
    await this.db.client.nFLTeam.deleteMany();
    await this.db.client.news.deleteMany();
  }


  async initialUpdate() {
    await this.clearDB();

    console.log('Adding all NFL teams, schedules, and players to the db...');
    await this.updateTimeframes(1);
    await this.updateTeams();
    await this.updateSchedule();
    await this.updateCompletedGames();
    await this.updatePlayers();
    console.log('Updating game scores and player stats...');
    await this.updateGameScoresAndPlayerStats();
    console.log('Updating general news...');
    await this.updateNews();
    console.log('Updating player projections...');
    await this.updatePlayerProjections();

    await this.printDatabase();
  }

  async updateTimeframes(week) {
    const resp = await this.stats.getTimeframes();

    if (resp.data) {
      let timeframes = Object(resp.data);

      timeframes = timeframes.map((tf) => {
        if (Number(tf.Season) > 2021 && Number(tf.Week) > week && Number(tf.SeasonType) === 1) {
          tf.HasEnded = false;
          tf.HasStarted = false;
        } else if (
          Number(tf.Season) > 2021 &&
          Number(tf.Week) === week &&
          Number(tf.SeasonType) === 1
        ) {
          tf.HasEnded = false;
          tf.HasStarted = true;
        }

        return tf;
      });

      await this.db.setTimeframes(timeframes);
    }
  }

  async updateTeams() {
    const timeframe: Timeframe = await this.db.getTimeframe();

    if (timeframe) {
      const resp: respObj = await this.stats.getNFLTeams(timeframe.season);

      if (resp.data) {
        const data = Object(resp.data);

        const teams = data.map((team) => {
          return {
            external_id: team.TeamID,
            key: team.Key,
            city: team.City,
            name: team.Name,
            season: timeframe.season,
          };
        });

        await this.db.setNFLTeams(teams);
      }
    }
  }

  async updatePlayers() {

    try {
      const allPlayersResp: respObj = await this.stats.getPlayers();
      const fantasyPlayersResp: respObj = await this.stats.getTopPlayers();

      if(allPlayersResp.data && fantasyPlayersResp.data)
      {
          // Filter out free agents (TODO in the future let free agents be in the app) and if they don't play a fantasy position 
          let allPlayerDetails = Object(allPlayersResp.data);
          let fantasyPlayers = Object(fantasyPlayersResp.data);

          allPlayerDetails = allPlayerDetails.filter((player) => player.GlobalTeamID > 0 && config.allowedPositions.includes(player.Position));
          fantasyPlayers = fantasyPlayers.filter((player) => player.GlobalTeamID > 0 && config.allowedPositions.includes(player.Position));

          fantasyPlayers = fantasyPlayers.filter((p) => p.FantasyPointsPPR > 40);

          const finalPlayers = [];

          for(const fantasyPlayer of fantasyPlayers)
          {
            const details = allPlayerDetails.find((p) => p.PlayerID === fantasyPlayer.PlayerID);

            if(details)
              finalPlayers.push(details);
          }

          const players = finalPlayers.map((p) => {
            return {
                external_id: p.PlayerID,
                first_name: p.FirstName,
                last_name: p.LastName,
                status: p.Status,
                position: p.Position,
                photo_url: p.PhotoUrl,
                nfl_team_external_id: p.GlobalTeamID,
            };
          });

          await this.db.setPlayers(players);

      }
    }
    catch(err) {
      console.log(err);
    }
  }

  async updateNews() {
    const resp: respObj = await this.stats.getNews();

    if (resp.data) {
      const data = Object(resp.data);

      const news: News[] = data.map((n) => {
        return {
          external_id: n.NewsID,
          updated_date: n.Updated,
          time_posted: n.TimeAgo,
          title: n.Title,
          content: n.Content,
          external_player_id: n.PlayerID,
          external_player_id2: n.PlayerID2,
          external_team_id: n.TeamID,
          external_team_id2: n.TeamID2,
          source: n.OriginalSource,
          source_url: n.OriginalSourceUrl,
        };
      });

      await this.db.setNews(news);
    }
  }

  async updateSchedule() {
    const timeframe: Timeframe = await this.db.getTimeframe();

    if (timeframe) {
      const resp: respObj = await this.stats.getSchedules(timeframe.season);

      if (resp.data) {
        const data = Object(resp.data);

        const games: NFLGame[] = data
          .filter((g) => g.GameKey)
          .map((g) => {
            return {
              external_id: Number(g.GameKey),
              season: g.Season,
              week: g.Week,
              date: new Date(g.Date),
              away_team_id: g.GlobalAwayTeamID,
              home_team_id: g.GlobalHomeTeamID,
              status: g.Status,
              external_score_id: g.ScoreID,
            };
          });

        await this.db.setNFLSchedule(games);
      }
    }
  }

  async updateCompletedGames() {
    const gamesCompleted = await this.db.getCompletedGames();

    if (gamesCompleted.length) {
      for (const game of gamesCompleted) {
        const resp: respObj = await this.stats.getBoxScore(game.external_score_id);

        if (resp.data) {
          const boxScore = Object(resp.data);

          const game = await this.db.updateScore(
            Number(boxScore.Score.GameKey),
            boxScore.Score.homeScore,
            boxScore.Score.AwayScore,
          );

          for (const pg of boxScore.PlayerGames) {
            const playerId = await this.db.externalToInternalPlayer(pg.PlayerID);
            const teamId = await this.db.externalToInternalNFLTeam(Number(pg.GlobalTeamID));

            if (playerId) {
              // Have to use Math.floor to convert floats to Int becuase the data is scrambled
              const gameStats = {
                external_player_id: pg.PlayerID,
                external_game_id: Number(pg.GameKey),
                player_id: playerId,
                team_id: teamId,
                game_id: game.id,
                pass_yards: Math.floor(pg.PassingYards),
                pass_attempts: Math.floor(pg.PassingAttempts),
                completions: Math.floor(pg.PassingCompletions),
                pass_td: Math.floor(pg.PassingTouchdowns),
                interceptions_thrown: Math.floor(pg.PassingInterceptions),
                fumbles: Math.floor(pg.Fumbles),
                receptions: Math.floor(pg.Receptions),
                rec_td: Math.floor(pg.ReceivingTouchdowns),
                rec_yards: Math.floor(pg.ReceivingYards),
                targets: Math.floor(pg.ReceivingTargets),
                rush_attempts: Math.floor(pg.RushingAttempts),
                rush_yards: Math.floor(pg.RushingYards),
                rush_td: Math.floor(pg.RushingTouchdowns),
                two_point_conversion_passes: Math.floor(pg.TwoPointConversionPasses),
                two_point_conversion_runs: Math.floor(pg.TwoPointConversionRuns),
                two_point_conversion_receptions: Math.floor(pg.TwoPointConversionReceptions),
              };

              await this.db.updatePlayerGameStats(gameStats);
            }
          }
        }
      }
    }
  }

  async updatePlayerProjections() {
    const timeframe: Timeframe = await this.db.getTimeframe();
    // get player projections for weeks 1-7
    for (let i = 1; i <= timeframe.week; i++) {
      const resp: respObj = await this.stats.getAllPlayersProjectedGameStats(2022, i);

      if (resp.data) {
        const data = Object(resp.data);

        for (const proj of data) {
          const playerId = await this.db.externalToInternalPlayer(proj.PlayerID);
          const teamId = await this.db.externalToInternalNFLTeam(proj.TeamID);
          const gameId = await this.db.externalToInternalNFLGame(Number(proj.GameKey));

          if (playerId) {
            const gameProjection = {
              external_player_id: proj.PlayerID,
              external_game_id: Number(proj.GameKey),
              player_id: playerId,
              team_id: teamId,
              game_id: gameId,
              pass_yards: Math.floor(proj.PassingYards),
              pass_attempts: Math.floor(proj.PassingAttempts),
              completions: Math.floor(proj.PassingCompletions),
              pass_td: Math.floor(proj.PassingTouchdowns),
              interceptions_thrown: Math.floor(proj.PassingInterceptions),
              fumbles: Math.floor(proj.Fumbles),
              receptions: Math.floor(proj.Receptions),
              rec_td: Math.floor(proj.ReceivingTouchdowns),
              rec_yards: Math.floor(proj.ReceivingYards),
              targets: Math.floor(proj.ReceivingTargets),
              rush_attempts: Math.floor(proj.RushingAttempts),
              rush_yards: Math.floor(proj.RushingYards),
              rush_td: Math.floor(proj.RushingTouchdowns),
              two_point_conversion_passes: Math.floor(proj.TwoPointConversionPasses),
              two_point_conversion_runs: Math.floor(proj.TwoPointConversionRuns),
              two_point_conversion_receptions: Math.floor(proj.TwoPointConversionReceptions),
            };

            await this.db.updatePlayerProjections(gameProjection);
          }
        }
      }
    }
  }

  async updateGameScoresAndPlayerStats() {
    const gamesInProgress = await this.db.getGamesInProgress();

    if (gamesInProgress.length) {
      for (const game of gamesInProgress) {
        const resp: respObj = await this.stats.getBoxScore(game.external_score_id);

        if (resp.data) {
          const boxScore = Object(resp.data);

          const game = await this.db.updateScore(
            Number(boxScore.Score.GameKey),
            boxScore.Score.homeScore,
            boxScore.Score.AwayScore,
          );

          for (const pg of boxScore.PlayerGames) {
            const playerId = await this.db.externalToInternalPlayer(pg.PlayerID);
            const teamId = await this.db.externalToInternalNFLTeam(Number(pg.TeamID));

            if (playerId) {
              // Have to use Math.floor to convert floats to Int becuase the data is scrambled
              const gameStats = {
                external_player_id: pg.PlayerID,
                external_game_id: Number(pg.GameKey),
                player_id: playerId,
                team_id: teamId,
                game_id: game.id,
                pass_yards: Math.floor(pg.PassingYards),
                pass_attempts: Math.floor(pg.PassingAttempts),
                completions: Math.floor(pg.PassingCompletions),
                pass_td: Math.floor(pg.PassingTouchdowns),
                interceptions_thrown: Math.floor(pg.PassingInterceptions),
                receptions: Math.floor(pg.Receptions),
                rec_yards: Math.floor(pg.ReceivingYards),
                targets: Math.floor(pg.ReceivingTargets),
                rush_attempts: Math.floor(pg.RushingAttempts),
                rush_yards: Math.floor(pg.RushingYards),
                rush_td: Math.floor(pg.RushingTouchdowns),
                two_point_conversion_passes: Math.floor(pg.TwoPointConversionPasses),
                two_point_conversion_runs: Math.floor(pg.TwoPointConversionRuns),
                two_point_conversion_receptions: Math.floor(pg.TwoPointConversionReceptions),
              };

              await this.db.updatePlayerGameStats(gameStats);
            }
          }
        }
      }
    }
  }
}

export default DataSinkApp;
