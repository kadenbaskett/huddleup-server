import axios from 'axios';

class StatsService {
  private async getRequest(url: string): Promise<string> {
    const key = '92b33b3c766b4421923b11b00b62adc5';
    const headers = { 'Ocp-Apim-Subscription-Key': key };
    const options = { headers };

    try {
      const resp = await axios.get(url, options);
      console.log(resp.data);
      return resp.data;
    } catch (err) {
      console.log(err);
      return 'Error';
    }
  }

  public async getStats(): Promise<string> {
    const url = 'https://api.sportsdata.io/v3/nfl/scores/json/CurrentSeason';

    const data = this.getRequest(url);

    return data;
  }
}

export default StatsService;
