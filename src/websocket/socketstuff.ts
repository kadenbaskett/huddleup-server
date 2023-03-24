import * as http from 'http';
import * as sockjs from 'sockjs';

const clients = {};


function broadcast(message){
    console.log('Number of clients: ', Object.keys(clients).length);

    for (const client in clients){
        clients[client].write(JSON.stringify(message));
    }
}

export function runWebsocket() {

    const echo = sockjs.createServer();

    echo.on('connection', function(conn) {

        clients[conn.remoteAddress] = conn;

        conn.on('data', function(message) {
            // console.log(JSON.parse(message));
            broadcast(JSON.parse(message));
        });

        conn.on('close', function() {
            delete clients[conn.remoteAddress];
        });
    
    });

    const server = http.createServer();

    echo.installHandlers(server, { prefix:'/echo' });

    server.listen(9999, '0.0.0.0');
}
