import { DRAFT as DRAFT_CONFIG, ROSTER_START_CONSTRAINTS } from '@/config/huddleup_config';
import Seed from '@/datasink/seed';
import { DraftState, AutoDraft, DraftOrder } from '@/interfaces/draftstate.interface';
import { DraftPlayer, DraftQueue, Team } from '@prisma/client';
import DatabaseService from '@services/database.service';

import * as http from 'http';
import * as sockjs from 'sockjs';

let timerOn = false;
let timer: NodeJS.Timeout;

const delay = ms => new Promise(res => setTimeout(res, ms));

class DraftSocketServer {
    db: DatabaseService;
    seed: Seed;
    clients: any;
    PORT: number;
    HOST: string;
    PREFIX: string;
    draftState: DraftState;
    leagueId: number;
    serverSocket: any;

    constructor(leagueId: number, port: number) {
        this.clients = {};
        this.PORT = port;
        this.HOST = '0.0.0.0';
        this.PREFIX = '/websocket/draft';
        this.db = new DatabaseService();
        this.seed = new Seed();

        this.draftState = {
            draftPlayers: [],
            draftQueue: [],
            draftOrder: [],
            autoDraft: [],
            currentPickNum: 1,
            currentPickTeamId: -1, // this shouldn't matter but who knows
            currentRoundNum: 1,
            currentPickTimeMS: 0,
            draftStartTimeMS: 0,
            secondsPerPick: DRAFT_CONFIG.SECONDS_PER_PICK,
            autoSecondsPerPick: DRAFT_CONFIG.AUTO_SECONDS_PER_PICK,
        };
        this.leagueId = leagueId;
    }

    async startTimer() {
      timerOn = true;
      console.log('starting timer');
      const isOnAuto = this.draftState.autoDraft.find((team) => team.teamId === this.draftState.currentPickTeamId).auto;
      console.log('isOnAuto', isOnAuto);
      if(isOnAuto)
      {
          timer = setTimeout(async () => {
            await this.autoDraft();
            await this.advanceDraftPick();
            await this.stopTimer();
            await this.startTimer();
          }, (DRAFT_CONFIG.AUTO_SECONDS_PER_PICK * 1000) + DRAFT_CONFIG.PICK_DELAY_MS);
      }
      else
      {
        timer = setTimeout(async () => {
            await this.autoDraft();
            await this.advanceDraftPick();
            await this.stopTimer();
            await this.startTimer();
          }, (DRAFT_CONFIG.SECONDS_PER_PICK * 1000) + DRAFT_CONFIG.PICK_DELAY_MS);
      }
    }

    stopTimer() {
      console.log('stopping timer');
      timerOn = false;
      clearTimeout(timer);
    }


    async loadDraftOrderFromDB(leagueId: number, round: number): Promise<DraftOrder[]> {
        let draftOrder = await this.db.getDraftOrder(leagueId);
        if (round % 2 !== 0) draftOrder = draftOrder.reverse();
        // console.log('draftOrder', draftOrder);

        const formattedDraftOrder: DraftOrder[] = draftOrder.map((order) => {
            return {
                teamId: order.team_id,
                pick: order.pick_number + (round - 1) * draftOrder.length,
            };
        });
        return formattedDraftOrder;
    }

    async loadAutoDraftFromDB(leagueId: number): Promise<AutoDraft[]> {
        // const league = await this.db.getLeagueInfo(leagueId);
        const teams: Team[] = await this.db.getTeamsInLeague(leagueId);
        const autoDraft: AutoDraft[] = teams.map((team)=> { return {
            teamId: team.id,
            auto: true,
        };});
        return autoDraft;
    }

    async loadDraftRound(leagueId: number, pick: number) {
        // const league = await this.db.getLeagueInfo(leagueId);
        const teams: Team[] = await this.db.getTeamsInLeague(leagueId);
        const round = Math.floor((pick - 1)/teams.length);
        return round + 1;
    }

    async loadDraftStateFromDB(): Promise<DraftState> {
        const dqs: DraftQueue[] = await this.db.getDraftQueue(this.leagueId);
        const dps: DraftPlayer[] = await this.db.getDraftPlayers(this.leagueId);
        const ads: AutoDraft[] = await this.loadAutoDraftFromDB(this.leagueId);
        const pick: number = await this.db.getDraftPickNumber(this.leagueId);
        const round: number = await this.loadDraftRound(this.leagueId, pick);
        const dos: DraftOrder[] = await this.loadDraftOrderFromDB(this.leagueId, round);
        const currentPickTeamId: number = dos.find((order) => order.pick === pick).teamId;
        const draftStartTime = await this.db.getDraftTime(this.leagueId);
        const draftStateTimeMS = new Date(draftStartTime).getTime();

        const msgContent: DraftState = {
            draftPlayers: dps,
            draftQueue: dqs,
            autoDraft: ads,
            draftOrder: dos,
            currentPickNum: pick,
            currentRoundNum: round,
            currentPickTeamId: currentPickTeamId,
            currentPickTimeMS: 0,
            draftStartTimeMS: draftStateTimeMS,
            secondsPerPick: DRAFT_CONFIG.SECONDS_PER_PICK,
            autoSecondsPerPick: DRAFT_CONFIG.AUTO_SECONDS_PER_PICK,
        };
        return msgContent;
    }

    broadcast(msgContent, msgType = DRAFT_CONFIG.MSG_TYPES.PING){
        const broadcastTime = new Date().getTime();

        for (const client in this.clients){

            const message = {
                content: msgContent,
                time: broadcastTime,
                type: msgType,
            };

            this.clients[client].write(JSON.stringify(message));
        }
    }

    async sendDraftState()
    {
        this.broadcast(this.draftState, DRAFT_CONFIG.MSG_TYPES.DRAFT_UPDATE);

        const numPlayersDraftedSoFar = this.draftState.draftPlayers.length;
        const numPlayersToBeDrafted = ROSTER_START_CONSTRAINTS.TOTAL * this.draftState.draftOrder.length;
        const draftOrderSet = this.draftState.draftOrder.length > 0;

        if(numPlayersDraftedSoFar >= numPlayersToBeDrafted && draftOrderSet)
        {
            await this.endDraft();
        }
    }

    getConnectionKey(connection) {
        return connection.id;
    }

    // playerAlreadyQueued(player_id, team_id) {
    //     return this.draftState.draftQueue.find((dq: DraftQueue) => {
    //         return dq.id === player_id && dq.league_id === this.leagueId && dq.team_id === team_id;
    //     });
    // }

    // async updatePlayerQueue(player_id, team_id, newOrder) {
    //     // const pq: DraftQueue = await this.db.updatePlayerQueue(player_id, team_id, newOrder);
    // }

    playerAlreadyDrafted(player_id) {
        return this.draftState.draftPlayers.find((dp: DraftPlayer) => {
            return dp.id === player_id && dp.league_id === this.leagueId;
        });
    }

    onConnection(conn)
    {
        this.clients[this.getConnectionKey(conn)] = conn;

        conn.on('data', (data) => this.onData(data));

        conn.on('close', () => this.onClose(conn));

        console.log('New connection: ', this.getConnectionKey(conn));
        console.log('Number of clients: ', Object.keys(this.clients).length);
    }

    // Current pick num is the pick that has just been made
    async advanceDraftPick() {
        // console.log('advance draft pick');
      // round over
      if(this.draftState.currentPickNum % this.draftState.draftOrder.length === 0) {
        // console.log(`round ${this.draftState.currentRoundNum} over`);
        this.draftState.currentRoundNum += 1;
        this.draftState.draftOrder = await this.loadDraftOrderFromDB(this.leagueId, this.draftState.currentRoundNum);
      }
      this.draftState.currentPickNum += 1;
      const nextTeam = this.draftState.draftOrder.find((d)=> d.pick === this.draftState.currentPickNum);
      this.draftState.currentPickTeamId = nextTeam.teamId;

      this.draftState = {
        ...this.draftState,
        currentPickTimeMS: new Date().getTime() + DRAFT_CONFIG.PICK_DELAY_MS,
      };
      this.sendDraftState();
    }


    async autoDraft() {
      console.log('auto draft');
      const players = await this.db.getAllPlayersDetails();
      const draftPlayers = await this.db.getDraftPlayers(this.leagueId);
      const draftPlayerPlayerIds = draftPlayers.map((p) => p.player_id);
      const availablePlayers = await players.filter((p) => {if (!draftPlayerPlayerIds.includes(p.id)) return p;} );

      // TODO: Further filtering on available players
      const player = availablePlayers[0];
      // Actually Draft Player
      await this.draftPlayer(player.id, this.draftState.currentPickTeamId, this.leagueId);
      this.sendDraftState();

    //   console.log(`${this.draftState.currentPickTeamId} auto drafted ${player}`);
    }

    async draftPlayer(player_id, team_id, league_id): Promise<DraftPlayer> {
      await this.db.draftPlayerToRoster(player_id, team_id, league_id);
      const draftPlayer = await this.db.draftPlayer(player_id, team_id, league_id);
    //   console.log('Player drafted: ', draftPlayer);
      this.draftState = {
          ...this.draftState,
          draftPlayers: [
            ...this.draftState.draftPlayers,
            draftPlayer,
          ],
        };
      return draftPlayer;
    }

    async onData(data)
    {
        data = JSON.parse(data);

        // console.log(data);
        const userId: number = data.content.user_id;
        const league_id: number = data.content.league_id;
        const team_id: number = data.content.team_id;
        const player_id: number = data.content.player_id;

        // TODO maybe some checks for the type of content received
        const qPlayer: DraftQueue = null;
        const draftPlayer: DraftPlayer = null;

        switch (data.type) {
            // case DRAFT_CONFIG.MSG_TYPES.QUEUE_PLAYER:
            //     if(this.playerAlreadyQueued(player_id, team_id)) break;

            //     qPlayer = await this.db.queuePlayer(player_id, team_id, league_id, data.content.order);
            //     this.draftState = {
            //         ...this.draftState,
            //         draftQueue: [
            //             ...this.draftState.draftQueue,
            //             qPlayer,
            //         ],
            //     };
            //     this.sendDraftState();
            //     break;
            // case DRAFT_CONFIG.MSG_TYPES.REMOVE_QUEUE_PLAYER:
            //     await this.db.removeQueuePlayer(data.content.qPlayerId);
            //     this.draftState = {
            //         ...this.draftState,
            //         draftQueue: [
            //             ...this.draftState.draftQueue,
            //             qPlayer,
            //         ],
            //     };
            //     this.sendDraftState();
            //     break;
            case DRAFT_CONFIG.MSG_TYPES.DRAFT_PLAYER:
                if(this.playerAlreadyDrafted(player_id)) break;
                if(this.draftState.currentPickTeamId !== data.content.team_id) break;
                if(timerOn) {
                    this.stopTimer();
                    await this.draftPlayer(player_id, team_id, league_id);
                    await this.advanceDraftPick();
                    await this.startTimer();
                }
                break;
            case DRAFT_CONFIG.MSG_TYPES.INITIAL_CONNECTION:
                console.log('initial conn', data);
                const autoIndex = this.draftState.autoDraft.findIndex((auto)=> auto.teamId === team_id);
                this.draftState.autoDraft[autoIndex] = {
                    teamId: team_id,
                    auto: false,
                };
                this.sendDraftState();
                break;
            case DRAFT_CONFIG.MSG_TYPES.FILL_DRAFT:
                console.log('Finishing and filling draft');
                await this.forceEndDraft();
                break;
            default:
                console.log('Unexpected message type received from client: ', data.type);
                console.log(data.content);
        }
    }

    onClose(conn)
    {
        console.log('Closing connection to: ', this.getConnectionKey(conn));
        delete this.clients[this.getConnectionKey(conn)];
    }

    private async startDraft()
    {
        const draftTimeFromDB = await this.db.getDraftTime(this.leagueId);
        const draftTime = new Date(draftTimeFromDB).getTime();
        const now = new Date().getTime();
        const diff = draftTime - now;

        // If draft scheduled to start in the future, delay
        if(diff > 0)
        {
            console.log('delaying by ', diff / 1000, ' seconds');
            await delay(diff);
        }

        console.log('starting the draft timer now');
        this.draftState = {
            ...this.draftState,
            currentPickTimeMS: new Date().getTime() + DRAFT_CONFIG.PICK_DELAY_MS,
        };
        this.sendDraftState();
        await this.startTimer();
    }

    private async endDraft()
    {
        console.log(`Ending draft in ${DRAFT_CONFIG.DRAFT_END_BUFFER_TIME_MS}`);

        this.broadcast({}, DRAFT_CONFIG.MSG_TYPES.END_DRAFT);

        await this.seed.simulateMatchups(this.leagueId);

        console.log('Closing server socket');
        this.serverSocket?.close();


        await delay(DRAFT_CONFIG.DRAFT_END_BUFFER_TIME_MS);

        const statusCode = 1;
        console.log(`Exiting process with status code ${statusCode}`);
        process.exit(statusCode);
    }

    private async forceEndDraft()
    {
        console.log(`Ending draft in ${DRAFT_CONFIG.DRAFT_END_BUFFER_TIME_MS}`);

        this.broadcast({}, DRAFT_CONFIG.MSG_TYPES.END_DRAFT);

        await this.seed.simulateMatchups(this.leagueId);

        await this.seed.finishDraft(this.leagueId);

        console.log('Closing server socket');
        this.serverSocket?.close();

        await delay(DRAFT_CONFIG.DRAFT_END_BUFFER_TIME_MS);

        const statusCode = 1;
        console.log(`Exiting process with status code ${statusCode}`);
        process.exit(statusCode);
    }

    public async start() {
        // Initialize the draft state before opening up websocket
        try{
            console.log('Starting the draft');

            this.draftState = await this.loadDraftStateFromDB();

            this.serverSocket = sockjs.createServer();

            this.serverSocket.on('connection', (conn) => this.onConnection(conn));

            const httpServer = http.createServer();

            this.serverSocket.installHandlers(httpServer, { prefix: this.PREFIX });

            httpServer.listen(this.PORT, this.HOST);

            void this.startDraft();
        }
        catch(e)
        {
            console.log('failed in the start');
            console.log('e', e);
        }
    }
}

export default DraftSocketServer;


