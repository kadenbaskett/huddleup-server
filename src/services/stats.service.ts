import axios from 'axios';
import { respObj } from '@interfaces/respobj.interface';


class StatsService {

  key: string;
  baseScoresURL: string;
  baseStatsURL: string;
  baseProjectionURL: string;
  headers: object;
  options: object;

  constructor()
  {
    this.key = '92b33b3c766b4421923b11b00b62adc5';
    this.headers = { 'Ocp-Apim-Subscription-Key': this.key };
    this.options = { headers: this.headers };
    this.baseScoresURL = 'https://api.sportsdata.io/v3/nfl/scores/json/';
    this.baseStatsURL = 'https://api.sportsdata.io/v3/nfl/stats/json/';
    this.baseProjectionURL = 'https://api.sportsdata.io/v3/nfl/projections/json/';
  }

  private async getRequest(url: string): Promise<respObj> {
    try 
    {
      const resp = await axios.get(url, this.options);
      return { data: resp.data, error: null };
    } 
    catch (err) 
    {
      console.log(err);
      return { data: null, error: err };
    }
  }


  // General NFL endpoints with no params

  public async getNFLTeams(): Promise<respObj> {
    const url = this.baseScoresURL + 'Teams';
    return await this.getRequest(url);
  }

  public async getCurrentWeek(): Promise<respObj> {
    const url = this.baseScoresURL + 'CurrentWeek';
    return await this.getRequest(url);
  }

  public async getUpcomingWeek(): Promise<respObj> {
    const url = this.baseScoresURL + 'UpcomingWeek';
    return await this.getRequest(url);
  }

  public async getLastCompletedWeek(): Promise<respObj> {
    const url = this.baseScoresURL + 'LastCompletedWeek';
    return await this.getRequest(url);
  }

  public async getCurrentSeason(): Promise<respObj> {
    const url = this.baseScoresURL + 'CurrentSeason';
    return await this.getRequest(url);
  }
  
  public async getNews(): Promise<respObj> {
    const url = this.baseScoresURL + 'News';
    return await this.getRequest(url);
  }

  public async getTopFantasyPlayersByADP(): Promise<respObj> {
    const url = this.baseStatsURL + 'FantasyPlayers';
    return await this.getRequest(url);
  }

  public async getAllPlayersDetails(): Promise<respObj> {
    const url = this.baseScoresURL + 'Players';
    return await this.getRequest(url);
  }


  // Endpoints requiring params but unrelated to individual players
  
  public async getAllTeamSchedules(season: number): Promise<respObj> {
    const url = this.baseScoresURL + 'Schedules/' + season;
    return await this.getRequest(url);
  }

  public async getByeWeeks(season: number): Promise<respObj> {
    const url = this.baseScoresURL + 'Byes/' + season;
    return await this.getRequest(url);
  }

  public async getAllPlayersProjectedGameStats(season: number, week: number): Promise<respObj> {
    const url = this.baseProjectionURL + 'PlayerGameProjectionStatsByWeek/' + season + '/' + week;
    return await this.getRequest(url);
  }


  // Endpoints requiring PlayerID params

  public async getPlayerDetails(playerID: number): Promise<respObj> {
    playerID = 732;
    const url = this.baseScoresURL + 'Player/' + playerID;
    return await this.getRequest(url);
  }

  public async getPlayerNews(playerID: number): Promise<respObj> {
    playerID = 732;
    const url = this.baseScoresURL + 'NewsByPlayerID/' + playerID;
    return await this.getRequest(url);
  }
  
  public async getPlayerGameLogs(playerID: number, season: number, numberOfGames: number): Promise<respObj> {
    const gamesToGet: string = numberOfGames ? String(numberOfGames) : 'all';
    const url = this.baseStatsURL + 'PlayerGameStatsBySeason/' + season + '/' + playerID + '/' + gamesToGet;
    return await this.getRequest(url);
  }
  
  public async getPlayerStatsByWeek(playerID: number, season: number): Promise<respObj> {
    const url = this.baseStatsURL + 'PlayerGameStatsByWeek/' + season + '/' + playerID;
    return await this.getRequest(url);
  }

  public async getPlayerProjectedSeasonStats(playerID: number, season: number): Promise<respObj> {
    const url = this.baseProjectionURL + 'PlayerSeasonProjectionStatsByPlayerID/' + season + '/' + playerID;
    return await this.getRequest(url);
  }


  
  

}

export default StatsService;
