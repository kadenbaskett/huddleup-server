import { DRAFT, DRAFT as DRAFT_CONFIG } from '@/config/huddleup_config';
import DatabaseService from '@/services/database.service';
import { getUniquePortForDraft, startDraftChildProcess } from '@/services/general.service';

export class TaskManager {

  private db: DatabaseService;
  private draftPorts; // Dictionary from league id to port number for draft websocket server

  constructor() {
    this.db = new DatabaseService();
    this.draftPorts = {};
  }

  start()
  {
    setInterval(this.checkForDrafts.bind(this), DRAFT_CONFIG.DRAFT_INTERVAL_TIME);
  }

  async checkForDrafts()
  {
    // console.log('Checking for drafts to start');

    try {
        const leagues = await this.db.getLeaguesDraftingSoon(DRAFT_CONFIG.DRAFT_BUFFER_TIME_FUTURE_MS, DRAFT_CONFIG.DRAFT_BUFFER_TIME_PAST_MS);

        for(const league of leagues)
        {
            const hasEnoughTeams = await this.db.leagueHasEnoughTeams(league.id);

            if(hasEnoughTeams)
            {
              if(!this.draftPorts[league.id]) 
              {
                  this.draftPorts[league.id] = getUniquePortForDraft(league.id);
  
                  // Make sure draft order is set before we launch the websocket
                  const hasCorrectDraftOrderLength = await this.db.hasCorrectDraftOrderLength(league.id);

                  if(!hasCorrectDraftOrderLength)
                  {
                      await this.db.setRandomDraftOrder(league.id);
                  }
                  
                  startDraftChildProcess(league.id, this.draftPorts[league.id], this.exitCallback);
              }
            }
            else
            {
              console.log('rescheduling');
              
              await this.rescheduleDraftDate(league.id);
            }
        }
    }
    catch (err)
    {
        console.log(err);
    }
  }

  public async rescheduleDraftDate(leagueId)
  {
      const now = new Date();
      now.setMilliseconds(now.getMilliseconds() + DRAFT.DRAFT_RESCHEDULE_TIME);
      await this.db.setDraftDate(now, leagueId);
  }

  checkForTrades()
  {
    console.log('Checking for trades to execute');
  }

  checkForWaivers()
  {
    console.log('Checking for waivers');
  }

  exitCallback(leagueId: number)
  {
    console.log('Exit callback: ', leagueId);
    this.draftPorts[leagueId] = null;
  }

}