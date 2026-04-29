const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) { res.writeHead(500); return res.end('Error'); }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

const wss = new WebSocket.Server({ server });
const colors = ['#ff4d4d', '#4dff88', '#4d94ff', '#f3ff4d']; 
let players = {}; 

wss.on('connection', (ws) => {
    let playerId = null;
    for (let i = 0; i < 4; i++) {
        if (!players[i]) { playerId = i; break; }
    }

    if (playerId === null) { ws.close(); return; }

    players[playerId] = ws;
    const playerColor = colors[playerId];

    // IMPORTANTE: idReal es para el código (0-3), idVisual es para humanos (1-4)
    const idVisual = playerId + 1;

    ws.send(JSON.stringify({ type: 'setup', id: playerId, idVisual: idVisual, color: playerColor }));
    broadcast({ type: 'new_player', id: playerId, color: playerColor });

    console.log(`✅ Jugador ${idVisual} conectado`);

    ws.on('message', (message) => {
        broadcast({ type: 'cmd', id: playerId, command: message.toString() });
    });

    ws.on('close', () => {
        delete players[playerId];
        broadcast({ type: 'remove_player', id: playerId });
        console.log(`❌ Jugador ${idVisual} desconectado`);
    });
});

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
}

server.listen(3000, '0.0.0.0', () => console.log('🚀 Servidor Pico Park en puerto 3000'));