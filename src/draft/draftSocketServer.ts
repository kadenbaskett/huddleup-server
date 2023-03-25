import { DraftState } from '@/interfaces/draftstate.interface';
import { DraftPlayer, DraftQueue } from '@prisma/client';
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
};


class DraftSocketServer {
    db: DatabaseService;
    clients: any;
    PORT: number;
    HOST: string;
    PREFIX: string;
    PING_INTERVAL: number;
    draftState: DraftState;
    leagueId: number;
  
    constructor(leagueId: number) {
        this.clients = {};
        this.PORT = 9999;
        this.HOST = '0.0.0.0';
        this.PREFIX = '/websocket/draft';
        this.PING_INTERVAL = 5000;
        this.db = new DatabaseService();
        this.draftState = {
            draftPlayers: [],
            draftQueue: [],
        };
        this.leagueId = leagueId;
    }

    async initDraftState()
    {
       this.draftState = await this.getUpdatedDraftState();
       console.log('Intial draft state: ', this.draftState);
    }

    async getUpdatedDraftState() {
        const dqs: DraftQueue[] = await this.db.getDraftQueue(this.leagueId);
        const dps: DraftPlayer[] = await this.db.getDraftPlayers(this.leagueId);
        const msgContent = {
            draftPlayers: dps,
            draftQueue: dqs,
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

                draftPlayer = await this.db.draftPlayer(player_id, team_id, league_id);
                console.log('Player drafted: ', draftPlayer);
                this.draftState = {
                    ...this.draftState,
                    draftPlayers: [
                        ...this.draftState.draftPlayers,
                        draftPlayer,
                    ],
                };
                this.sendDraftState();
                break;
            case MSG_TYPES.INITIAL_CONNECTION:
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

    public async start() {

        // Initialize the draft state before opening up websocket
        await this.initDraftState();

        const serverSocket = sockjs.createServer();

        serverSocket.on('connection', (conn) => this.onConnection(conn));

        const httpServer = http.createServer();

        serverSocket.installHandlers(httpServer, { prefix: this.PREFIX });

        httpServer.listen(this.PORT, this.HOST);

        setInterval(() => {
            this.sendPing();
        }, this.PING_INTERVAL);
    }
}

export default DraftSocketServer;


