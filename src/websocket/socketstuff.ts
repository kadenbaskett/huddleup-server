import DatabaseService from '@services/database.service';

import * as http from 'http';
// import { JsonWebTokenError } from 'jsonwebtoken';
import * as sockjs from 'sockjs';


class SocketStuff {
    db: DatabaseService;
    clients: any;
    PORT: number;
    HOST: string;
    PREFIX: string;
    PING_INTERVAL: number;
  
    constructor() {
        this.clients = {};
        this.PORT = 9999;
        this.HOST = '0.0.0.0';
        this.PREFIX = '/echo';
        this.PING_INTERVAL = 5000;
        this.db = new DatabaseService();
    }

    broadcast(message = null){
        const now = new Date().getTime();

        for (const client in this.clients){

            message = {
                ...message,
                time: now,
                clientKey: client,
            };

            this.clients[client].write(JSON.stringify(message));
        }
    }

    getConnectionKey(connection) {
        return connection.id;
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
        console.log('Data: ', data);
        data = JSON.parse(data);

        switch (data.type) {
            case 'queuePlayer':
                await this.db.queuePlayer(data.content.player_id, data.content.team_id, data.content.league_id);
                break;
            case 'draftPlayer':
                await this.db.draftPlayer(data.content.player_id, data.content.team_id, data.content.league_id);
                break;
            default:
                console.log('Unhandles type.');
        }
    }

    onClose(conn)
    {
        console.log('Closing connection to: ', this.getConnectionKey(conn));
        delete this.clients[this.getConnectionKey(conn)];
    }

    public runWebsocket() {
        const serverSocket = sockjs.createServer();

        serverSocket.on('connection', (conn) => this.onConnection(conn));

        const httpServer = http.createServer();

        serverSocket.installHandlers(httpServer, { prefix: this.PREFIX });

        httpServer.listen(this.PORT, this.HOST);

        setInterval(() => {
            try{
                this.broadcast();
            }
            catch(e){
                console.log('Error: ', e);
            }
        }, this.PING_INTERVAL);
    }
}

export default SocketStuff;


