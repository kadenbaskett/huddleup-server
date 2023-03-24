import * as http from 'http';
import * as sockjs from 'sockjs';

const clients = {};


function broadcast(message){
    for (const client in clients){
        const written = clients[client].write(JSON.stringify(message));
        console.log(written);
    }
}

function getConnectionKey(connection) {
    return connection.id;
}

export function runWebsocket() {

    const echo = sockjs.createServer();

    echo.on('connection', function(conn) {
        console.log('New connection: ', getConnectionKey(conn));

        clients[getConnectionKey(conn)] = conn;

        conn.on('data', function(message) {
            // console.log(JSON.parse(message));
            // broadcast(JSON.parse(message));
        });

        conn.on('close', function() {
            console.log('Closing connection to: ', getConnectionKey(conn));
            delete clients[getConnectionKey(conn)];
        });
    
        console.log('Number of clients: ', Object.keys(clients).length);

        for (const client in clients){
            console.log('Client: ', client);
        }

    });

    const server = http.createServer();

    echo.installHandlers(server, { prefix:'/echo' });

    server.listen(9999, '0.0.0.0');
}


