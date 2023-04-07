import { DraftState, AutoDraft, DraftOrder } from '@/interfaces/draftstate.interface';
import { DraftPlayer, DraftQueue, Team } from '@prisma/client';
import DatabaseService from '@services/database.service';

import * as http from 'http';
import * as sockjs from 'sockjs';

const MSG_TYPES = {
    PING: 'ping',
    INITIAL_CONNECTION: 'initialConnectionGetDraftState',
    DRAFT_UPDATE: 'draftUpdate',
    QUEUE_PLAYER: 'queuePlayer',
    REMOVE_QUEUE_PLAYER: 'removeQueuePlayer',
    RE_ORDER_QUEUE_PLAYER: 'removeQueuePlayer',
    DRAFT_PLAYER: 'draftPlayer',
    ERROR: 'error',
    END_DRAFT: 'end_draft',
};

// Ten mins
const DRAFT_BUFFER_TIME = 10 * 10000;

let timerOn = false;
let timer: NodeJS.Timeout;


class DraftSocketServer {
    db: DatabaseService;
    clients: any;
    PORT: number;
    HOST: string;
    PREFIX: string;
    PING_INTERVAL: number;
    draftState: DraftState;
    leagueId: number;
    serverSocket: any;

    constructor(leagueId: number, port: number) {
        this.clients = {};
        this.PORT = port;
        this.HOST = '0.0.0.0';
        this.PREFIX = '/websocket/draft';
        this.PING_INTERVAL = 5000;
        this.db = new DatabaseService();
        this.draftState = {
            draftPlayers: [],
            draftQueue: [],
            draftOrder: [],
            autoDraft: [],
            currentPickNum: 1,
            currentPickTeamId: -1, // this shouldn't matter but who knows
            currentRoundNum: 1,
        };
        this.leagueId = leagueId;
    }

    async startTimer() {
      timerOn = true;
      console.log('starting timer');
      timer = setInterval(async () => {
        // Code to be executed every 3 seconds
        console.log('Timer looped');
        await this.autoDraft();
        await this.advanceDraftPick();
      }, 30000);
    }

    stopTimer() {
      console.log('stopping timer');
      timerOn = false;
      clearInterval(timer);
    }

    delay = ms => new Promise(res => setTimeout(res, ms));

    async initDraftState()
    {
       this.draftState = await this.loadDraftStateFromDB();
       //this.draftOrder = await this.getUpdatedDraftOrder();
    //    console.log('Intial draft state: ', this.draftState);
    }

    async loadDraftOrderFromDB(leagueId: number, round: number): Promise<DraftOrder[]> {
        let draftOrder = await this.db.getDraftOrder(leagueId);
        console.log('draftOrder', draftOrder);
        if (round % 2 !== 0) draftOrder = draftOrder.reverse();
        const formattedDraftOrder: DraftOrder[] = draftOrder.map((order) => {
            return {
                teamId: order.team_id,
                pick: order.pick_number + (round - 1) * draftOrder.length,
            };
        });
        return formattedDraftOrder;
    }

    async loadAutoDraftFromDB(leagueId: number): Promise<AutoDraft[]> {
        const league = await this.db.getLeagueInfo(leagueId);
        const autoDraft: AutoDraft[] = league.teams.map((team)=> { return {
            teamId: team.id,
            auto: true,
        };});
        return autoDraft;
    }

    async loadDraftRound(leagueId: number, pick: number) {
        const league = await this.db.getLeagueInfo(leagueId);
        const numTeams: number = league.teams.length;
        let round = Math.floor((pick - 1)/numTeams);
        round += 1;
        return round;
    }

    async loadDraftStateFromDB(): Promise<DraftState> {
        const dqs: DraftQueue[] = await this.db.getDraftQueue(this.leagueId);
        // console.log('dqs', dqs);
        const dps: DraftPlayer[] = await this.db.getDraftPlayers(this.leagueId);
        // console.log('dps', dps);
        const ads: AutoDraft[] = await this.loadAutoDraftFromDB(this.leagueId);
        // console.log('ads', ads);
        const pick: number = await this.db.getDraftPickNumber(this.leagueId);
        // console.log('pick', pick);
        const round: number = await this.loadDraftRound(this.leagueId, pick);
        // console.log('round', round);
        const dos: DraftOrder[] = await this.loadDraftOrderFromDB(this.leagueId, round);
        // console.log('dos', dos);
        const currentPickTeamId: number = dos.find((order) => order.pick === pick).teamId;
        // console.log('currentPickTeamId', currentPickTeamId);
        const msgContent = {
            draftPlayers: dps,
            draftQueue: dqs,
            autoDraft: ads,
            draftOrder: dos,
            currentPickNum: pick,
            currentRoundNum: round,
            currentPickTeamId: currentPickTeamId,
        };
        return msgContent;
    }

    broadcast(msgContent, msgType = MSG_TYPES.PING){
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

    sendDraftState()
    {
        this.broadcast(this.draftState, MSG_TYPES.DRAFT_UPDATE);
    }

    sendPing()
    {
        this.broadcast({}, MSG_TYPES.PING);
    }

    getConnectionKey(connection) {
        return connection.id;
    }

    playerAlreadyQueued(player_id, team_id) {
        return this.draftState.draftQueue.find((dq: DraftQueue) => {
            return dq.id === player_id && dq.league_id === this.leagueId && dq.team_id === team_id;
        });
    }

    async updatePlayerQueue(player_id, team_id, newOrder) {
        // const pq: DraftQueue = await this.db.updatePlayerQueue(player_id, team_id, newOrder);
    }

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

    async advanceDraftPick() {
      // round over
      if(this.draftState.currentPickNum % this.draftState.draftOrder.length === 0) {
        console.log(`round ${this.draftState.currentRoundNum} over`);
        this.draftState.currentRoundNum += 1;
        this.draftState.draftOrder = await this.loadDraftOrderFromDB(this.leagueId, this.draftState.currentRoundNum);
      }
      this.draftState.currentPickNum += 1;
      const nextTeam = this.draftState.draftOrder.find((d)=> d.pick === this.draftState.currentPickNum);
      this.draftState.currentPickTeamId = nextTeam.teamId;
    }


    async autoDraft() {
      const players = await this.db.getAllPlayersDetails();
      const draftPlayers = await this.db.getDraftPlayers(this.leagueId);
      const draftPlayerPlayerIds = draftPlayers.map((p) => p.player_id);
      const availablePlayers = await players.filter((p) => {if (!draftPlayerPlayerIds.includes(p.id)) return p;} );

      // TODO: Further filtering on available players
      const player = availablePlayers[0];
      // Actually Draft Player
      await this.draftPlayer(player.id, this.draftState.currentPickTeamId, this.leagueId);
      this.sendDraftState();
      console.log(`${this.draftState.currentPickTeamId} auto drafted ${player}`);
    }

    async draftPlayer(player_id, team_id, league_id): Promise<DraftPlayer> {
      await this.db.draftPlayerToRoster(player_id, team_id, league_id);
      const draftPlayer = await this.db.draftPlayer(player_id, team_id, league_id);
      console.log('Player drafted: ', draftPlayer);
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
        let qPlayer: DraftQueue = null;
        let draftPlayer: DraftPlayer = null;

        switch (data.type) {
            case MSG_TYPES.QUEUE_PLAYER:
                if(this.playerAlreadyQueued(player_id, team_id)) break;

                qPlayer = await this.db.queuePlayer(player_id, team_id, league_id, data.content.order);
                this.draftState = {
                    ...this.draftState,
                    draftQueue: [
                        ...this.draftState.draftQueue,
                        qPlayer,
                    ],
                };
                this.sendDraftState();
                break;
            case MSG_TYPES.REMOVE_QUEUE_PLAYER:
                await this.db.removeQueuePlayer(data.content.qPlayerId);
                this.draftState = {
                    ...this.draftState,
                    draftQueue: [
                        ...this.draftState.draftQueue,
                        qPlayer,
                    ],
                };
                this.sendDraftState();
                break;
            case MSG_TYPES.DRAFT_PLAYER:
              if(this.playerAlreadyDrafted(player_id)) break;
              if(this.draftState.currentPickTeamId !== data.content.team_id) break;
              if(timerOn) {
                this.stopTimer();
                // await this.delay(5000);
                draftPlayer = await this.draftPlayer(player_id, team_id, league_id);
                this.advanceDraftPick();
                await this.startTimer();
              }
                this.sendDraftState();
                break;
            case MSG_TYPES.INITIAL_CONNECTION:
                console.log('initial conn', data);
                const autoIndex = this.draftState.autoDraft.findIndex((auto)=> auto.teamId === team_id);
                this.draftState.autoDraft[autoIndex] = {
                    teamId: team_id,
                    auto: false,
                };
                console.log(this.draftState.autoDraft);
                this.sendDraftState();
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
            await this.delay(diff);
        }

        console.log('starting the draft timer now');
        await this.startTimer();
    }

    private async endDraft()
    {
        console.log('ending draft');

        this.broadcast({
            type: MSG_TYPES.END_DRAFT,
        });

        this.serverSocket?.close();
        process.exit();
    }

    public async start() {
        // Initialize the draft state before opening up websocket
        await this.initDraftState();


        this.serverSocket = sockjs.createServer();

        this.serverSocket.on('connection', (conn) => this.onConnection(conn));

        const httpServer = http.createServer();

        this.serverSocket.installHandlers(httpServer, { prefix: this.PREFIX });

        httpServer.listen(this.PORT, this.HOST);

        setInterval(() => {
            this.sendPing();
        }, this.PING_INTERVAL);

        // TODO is void correct?
        void this.startDraft();
    }
}

export default DraftSocketServer;


