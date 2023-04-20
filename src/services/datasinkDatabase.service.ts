import {
  NFLGame,
  NFLTeam,
  Player,
  PrismaClient,
  News,
} from '@prisma/client';


/*
 * This is supposed to be one of the only places that we interact with the database (via a prisma client)
 * It should be used ONLY by the datasink
 */
class DatasinkDatabaseService {
  client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  // ***************** SETTERS ****************** //

  public async setTimeframes(timeframes): Promise<void> {
    try {
      for (const t of timeframes) {
        await this.client.timeframe.upsert({
          where: {
            season_week_type: {
              season: Number(t.Season),
              week: Number(t.Week),
              type: Number(t.SeasonType),
            },
          },
          update: {
            has_ended: t.HasEnded,
            has_started: t.HasStarted,
          },
          create: {
            season: Number(t.Season),
            week: Number(t.Week),
            type: Number(t.SeasonType),
            has_ended: t.HasEnded,
            has_started: t.HasStarted,
          },
        });
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public async setNFLTeams(teams): Promise<NFLTeam[]> {
    for (const t of teams) {
      try {
        await this.client.nFLTeam.upsert({
          where: {
            external_id: t.external_id,
          },
          update: {
            external_id: t.external_id,
            name: t.name,
            key: t.key,
            city: t.city,
            season: t.season,
          },
          create: {
            external_id: t.external_id,
            name: t.name,
            key: t.key,
            city: t.city,
            season: t.season,
          },
        });
      } catch (e) {
        console.log(e);
        console.log(t);
        return null;
      }
    }
  }

  public async setNews(news): Promise<News[]> {
    for (const n of news) {
      try {
        await this.client.news.upsert({
          where: {
            external_id: n.external_id,
          },
          update: {
            external_id: n.external_id,
            updated_date: n.updated_date,
            time_posted: n.time_posted,
            title: n.title,
            content: Buffer.from(n.content, 'utf8'),
            external_player_id: n.external_player_id,
            external_player_id2: n.external_player_id2,
            external_team_id: n.external_team_id,
            external_team_id2: n.external_team_id2,
            source: n.source,
            source_url: n.source_url,
          },
          create: {
            external_id: n.external_id,
            updated_date: n.updated_date,
            time_posted: n.time_posted,
            title: n.title,
            content: Buffer.from(n.content, 'utf8'),
            external_player_id: n.external_player_id,
            external_player_id2: n.external_player_id2,
            external_team_id: n.external_team_id,
            external_team_id2: n.external_team_id2,
            source: n.source,
            source_url: n.source_url,
          },
        });
      } catch (e) {
        console.log(e);
        console.log(n);
        return null;
      }
    }
  }

  public async setPlayers(players): Promise<Player[]> {
    for (const p of players) {
      try {
        await this.client.player.upsert({
          where: {
            external_id: p.external_id,
          },
          update: {
            external_id: p.external_id,
            first_name: p.first_name,
            last_name: p.last_name,
            status: p.status,
            position: p.position,
            photo_url: p.photo_url,
            current_nfl_team_external_id: p.nfl_team_external_id,
          },
          create: {
            external_id: p.external_id,
            first_name: p.first_name,
            last_name: p.last_name,
            status: p.status,
            position: p.position,
            photo_url: p.photo_url,
            current_nfl_team_external_id: p.nfl_team_external_id,
          },
        });
      } catch (e) {
        console.log(e);
        console.log(p);
        return null;
      }
    }
  }

  public async setNFLSchedule(games): Promise<NFLGame[]> {
    for (const g of games) {
      try {
        await this.client.nFLGame.upsert({
          where: {
            external_id: g.external_id,
          },
          update: {
            external_id: g.external_id,
            season: g.season,
            week: g.week,
            date: g.date,
            away_team_id: g.away_team_id,
            home_team_id: g.home_team_id,
            status: g.status,
            external_score_id: g.external_score_id,
          },
          create: {
            external_id: g.external_id,
            season: g.season,
            week: g.week,
            date: g.date,
            away_team_id: g.away_team_id,
            home_team_id: g.home_team_id,
            status: g.status,
            external_score_id: g.external_score_id,
            home_score: 0,
            away_score: 0,
          },
        });
      } catch (e) {
        console.log(e);
        console.log(g);
        return null;
      }
    }
  }

  public async updateScore(external_game_id: number, home_score: number, away_score: number) {
    try {
      const game = await this.client.nFLGame.update({
        where: {
          external_id: external_game_id,
        },
        data: {
          home_score: home_score,
          away_score: away_score,
        },
      });

      return game;
    } catch (e) {
      console.log(external_game_id, home_score, away_score);
      console.log(e);
      return null;
    }
  }

  public async updatePlayerGameStats(gameStats) {
    try {
      await this.client.playerGameStats.upsert({
        where: {
          external_game_id_external_player_id: {
            external_game_id: gameStats.external_game_id,
            external_player_id: gameStats.external_player_id,
          },
        },
        update: {
          external_game_id: gameStats.external_game_id,
          external_player_id: gameStats.external_player_id,
          pass_yards: gameStats.pass_yards,
          pass_attempts: gameStats.pass_attempts,
          completions: gameStats.completions,
          pass_td: gameStats.pass_td,
          interceptions_thrown: gameStats.interceptions_thrown,
          receptions: gameStats.receptions,
          rec_yards: gameStats.rec_yards,
          targets: gameStats.targets,
          rush_attempts: gameStats.rush_attempts,
          rush_yards: gameStats.rush_yards,
          rush_td: gameStats.rush_td,
          two_point_conversion_passes: gameStats.two_point_conversion_passes,
          two_point_conversion_runs: gameStats.two_point_conversion_runs,
          two_point_conversion_receptions: gameStats.two_point_conversion_runs,
          player_id: gameStats.player_id,
          team_id: gameStats.team_id,
          game_id: gameStats.game_id,
        },
        create: {
          external_game_id: gameStats.external_game_id,
          external_player_id: gameStats.external_player_id,
          pass_yards: gameStats.pass_yards,
          pass_attempts: gameStats.pass_attempts,
          completions: gameStats.completions,
          pass_td: gameStats.pass_td,
          interceptions_thrown: gameStats.interceptions_thrown,
          fumbles: gameStats.fumbles,
          receptions: gameStats.receptions,
          rec_td: gameStats.rec_td,
          rec_yards: gameStats.rec_yards,
          targets: gameStats.targets,
          rush_attempts: gameStats.rush_attempts,
          rush_yards: gameStats.rush_yards,
          rush_td: gameStats.rush_td,
          two_point_conversion_passes: gameStats.two_point_conversion_passes,
          two_point_conversion_runs: gameStats.two_point_conversion_runs,
          two_point_conversion_receptions: gameStats.two_point_conversion_runs,
          player_id: gameStats.player_id,
          team_id: gameStats.team_id,
          game_id: gameStats.game_id,
        },
      });
    } catch (e) {
      console.log(gameStats);
      console.log(e);
    }
  }

  public async updatePlayerProjections(proj) {
    try {
      await this.client.playerProjections.upsert({
        where: {
          external_game_id_external_player_id: {
            external_game_id: proj.external_game_id,
            external_player_id: proj.external_player_id,
          },
        },
        update: {
          external_game_id: proj.external_game_id,
          external_player_id: proj.external_player_id,
          pass_yards: proj.pass_yards,
          pass_attempts: proj.pass_attempts,
          completions: proj.completions,
          pass_td: proj.pass_td,
          interceptions_thrown: proj.interceptions_thrown,
          fumbles: proj.fumbles,
          receptions: proj.receptions,
          rec_td: proj.rec_td,
          rec_yards: proj.rec_yards,
          targets: proj.targets,
          rush_attempts: proj.rush_attempts,
          rush_yards: proj.rush_yards,
          rush_td: proj.rush_td,
          two_point_conversion_passes: proj.two_point_conversion_passes,
          two_point_conversion_runs: proj.two_point_conversion_runs,
          two_point_conversion_receptions: proj.two_point_conversion_runs,
          player_id: proj.player_id,
          team_id: proj.team_id,
          game_id: proj.game_id,
        },
        create: {
          external_game_id: proj.external_game_id,
          external_player_id: proj.external_player_id,
          pass_yards: proj.pass_yards,
          pass_attempts: proj.pass_attempts,
          completions: proj.completions,
          pass_td: proj.pass_td,
          interceptions_thrown: proj.interceptions_thrown,
          fumbles: proj.fumbles,
          receptions: proj.receptions,
          rec_td: proj.rec_td,
          rec_yards: proj.rec_yards,
          targets: proj.targets,
          rush_attempts: proj.rush_attempts,
          rush_yards: proj.rush_yards,
          rush_td: proj.rush_td,
          two_point_conversion_passes: proj.two_point_conversion_passes,
          two_point_conversion_runs: proj.two_point_conversion_runs,
          two_point_conversion_receptions: proj.two_point_conversion_runs,
          player_id: proj.player_id,
          team_id: proj.team_id,
          game_id: proj.game_id,
        },
      });
    } catch (e) {
      console.log(proj);
      console.log(e);
    }
  }

}

export default DatasinkDatabaseService;
