import * as http from 'http';
import * as sockjs from 'sockjs';

const clients = {};


function broadcast(message){
    for (const client in clients){
        clients[client].write(JSON.stringify(message));
    }
}

export function runWebsocket() {

    const echo = sockjs.createServer();

    echo.on('connection', function(conn) {

        clients[conn.id] = conn;

        conn.on('data', function(message) {
            console.log(JSON.parse(message));
            broadcast(JSON.parse(message));
        });

        conn.on('close', function() {
            delete clients[conn.id];
        });
    
    });

    const server = http.createServer();

    echo.installHandlers(server, { prefix:'/echo' });

    server.listen(9999, '0.0.0.0');
}
