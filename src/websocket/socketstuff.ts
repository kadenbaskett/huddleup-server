import * as http from 'http';
import * as sockjs from 'sockjs';

const clients = {};


// Broadcast to all clients
function broadcast(message){
    // iterate through each client in clients object
    for (const client in clients){
        // send the message to that client
        clients[client].write(JSON.stringify(message));
    }
}

export function runWebsocket() {

    // create sockjs server
    const echo = sockjs.createServer();

    // on new connection event
    echo.on('connection', function(conn) {

    // add this client to clients object
    clients[conn.id] = conn;

    // on receive new data from client event
    conn.on('data', function(message) {
        console.log(message);
        broadcast(JSON.parse(message));
    });

    // on connection close event
    conn.on('close', function() {
        delete clients[conn.id];
    });
    
    });

    // Create an http server
    const server = http.createServer();

    // Integrate SockJS and listen on /echo
    echo.installHandlers(server, { prefix:'/echo' });

    // Start server
    server.listen(9999, '0.0.0.0');

}
