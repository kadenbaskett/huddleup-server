import * as http from 'http';
import { JsonWebTokenError } from 'jsonwebtoken';
import * as sockjs from 'sockjs';

const clients = {};
const PORT = 9999;
const HOST = '0.0.0.0';
const PREFIX = '/echo';
const PING_INTERVAL = 5000;

function broadcast(message = null){

    const now = new Date().getTime();

    for (const client in clients){

        message = {
            ...message,
            time: now,
            clientKey: client,
        };

        clients[client].write(JSON.stringify(message));
    }
}

function getConnectionKey(connection) {
    return connection.id;
}

export function runWebsocket() {

    const serverSocket = sockjs.createServer();

    serverSocket.on('connection', function(conn) {

        clients[getConnectionKey(conn)] = conn;

        conn.on('data', function(message) {
            const data = JSON.parse(message);
            console.log('Type: ', data.type);

            switch (data.type) {
                case 'queuePlayer':
                    console.log('handlign queueing a player! ');
                    break;
                case 'draftPlayer':
                    console.log('handlign drafting a player! ');
                  break;
                default:
                  console.log('Unhandles type.');
            }

            // console.log(JSON.parse(message));
            // broadcast(JSON.parse(message));
        });

        conn.on('close', function() {
            console.log('Closing connection to: ', getConnectionKey(conn));
            delete clients[getConnectionKey(conn)];
        });
    
        console.log('New connection: ', getConnectionKey(conn));
        console.log('Number of clients: ', Object.keys(clients).length);
    });

    const httpServer = http.createServer();

    serverSocket.installHandlers(httpServer, { prefix: PREFIX });

    httpServer.listen(PORT, HOST);

    setInterval(() => {
        broadcast();
    }, PING_INTERVAL);
}


