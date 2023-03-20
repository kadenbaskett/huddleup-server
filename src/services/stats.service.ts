import axios from 'axios';
import { respObj } from '../datasink/interfaces/respobj.interface';

class StatsService {
  key: string;
  baseScoresURL: string;
  baseStatsURL: string;
  baseProjectionURL: string;
  headers: object;
  options: object;

  constructor() {
    this.key = process.env.API_KEY;
    this.headers = { 'Ocp-Apim-Subscription-Key': this.key };
    this.options = { headers: this.headers };
    this.baseScoresURL = 'https://api.sportsdata.io/v3/nfl/scores/json/';
    this.baseStatsURL = 'https://api.sportsdata.io/v3/nfl/stats/json/';
    this.baseProjectionURL = 'https://api.sportsdata.io/v3/nfl/projections/json/';
  }

  // Generic wrapper for a get request
  private async getRequest(url: string): Promise<respObj> {
    try {
      const resp = await axios.get(url, this.options);
      return { data: resp.data, error: null };
    } catch (err) {
      console.log(err);
      return { data: null, error: err };
    }
  }

  // Endpoints we hit on a recurring basis to keep our database in sync

  public async getTimeframes(): Promise<respObj> {
    const url = this.baseScoresURL + 'Timeframes/all';
    return await this.getRequest(url);
  }

  public async getNFLTeams(season: number): Promise<respObj> {
    const url = this.baseScoresURL + 'Teams/' + season;
    return await this.getRequest(url);
  }

  public async getPlayers(): Promise<respObj> {
    const url = this.baseScoresURL + 'Players';
    return await this.getRequest(url);
  }

  public async getSchedules(season: number): Promise<respObj> {
    const url = this.baseScoresURL + 'Schedules/' + season;
    return await this.getRequest(url);
  }

  public async getBoxScore(scoreID: number): Promise<respObj> {
    const url = this.baseStatsURL + 'BoxScoreByScoreIDV3/' + scoreID;
    return await this.getRequest(url);
  }

  // Unused endpoints (for now)

  public async getNews(): Promise<respObj> {
    const url = this.baseScoresURL + 'News';
    return await this.getRequest(url);
  }

  public async getTopFantasyPlayersByADP(): Promise<respObj> {
    const url = this.baseStatsURL + 'FantasyPlayers';
    return await this.getRequest(url);
  }

  public async getAllPlayersProjectedGameStats(season: number, week: number): Promise<respObj> {
    const url =
      this.baseProjectionURL + 'PlayerGameProjectionStatsByWeek/' + season + 'REG/' + week;
    return await this.getRequest(url);
  }

  // Endpoints requiring PlayerID params

  public async getPlayerDetails(playerID: number): Promise<respObj> {
    const url = this.baseScoresURL + 'Player/' + playerID;
    return await this.getRequest(url);
  }

  public async getPlayerNews(playerID: number): Promise<respObj> {
    playerID = 732;
    const url = this.baseScoresURL + 'NewsByPlayerID/' + playerID;
    return await this.getRequest(url);
  }

  public async getPlayerGameLogs(
    playerID: number,
    season: number,
    numberOfGames: number,
  ): Promise<respObj> {
    const gamesToGet: string = numberOfGames ? String(numberOfGames) : 'all';
    const url =
      this.baseStatsURL + 'PlayerGameStatsBySeason/' + season + '/' + playerID + '/' + gamesToGet;
    return await this.getRequest(url);
  }

  public async getPlayerStatsByWeek(playerID: number, season: number): Promise<respObj> {
    const url = this.baseStatsURL + 'PlayerGameStatsByWeek/' + season + '/' + playerID;
    return await this.getRequest(url);
  }

  public async getPlayerProjectedSeasonStats(playerID: number, season: number): Promise<respObj> {
    const url =
      this.baseProjectionURL + 'PlayerSeasonProjectionStatsByPlayerID/' + season + '/' + playerID;
    return await this.getRequest(url);
  }
}

export default StatsService;
