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
        console.log('broadcast firing');

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
        console.log('getting connection key firing');
        return connection.id;
    }

    public runWebsocket() {
        const serverSocket = sockjs.createServer();

        serverSocket.on('connection', function(conn) {
            console.log('Connection happening');
            this.clients[this.getConnectionKey(conn)] = conn;

            conn.on('data', async function(message) {
                const data = JSON.parse(message);
                console.log('Type: ', data.type);

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

                // broadcast a message to the rest of the draft

                // broadcast(JSON.parse(message));
            });

            conn.on('close', function() {
                console.log('Closing connection to: ', this.getConnectionKey(conn));
                delete this.clients[this.getConnectionKey(conn)];
            });
        
            console.log('New connection: ', this.getConnectionKey(conn));
            console.log('Number of clients: ', Object.keys(this.clients).length);
        });


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


