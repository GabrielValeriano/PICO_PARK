const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) return alias.address;
        }
    }
    return '0.0.0.0';
}

const localIP = getLocalIP();
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
let gameState = 'LOBBY'; 
let pausedBy = null;

wss.on('connection', (ws, req) => {
    let playerId = null;
    
    ws.on('message', (message) => {
        const rawMessage = message.toString();
        try {
            const data = JSON.parse(rawMessage);
            
            if (data.type === 'is_game') {
                ws.isGame = true;
                ws.send(JSON.stringify({ type: 'server_info', ip: localIP, state: gameState }));
                
                // --- SINCRONIZACIÓN: Mandar jugadores que ya están conectados al Monitor ---
                Object.keys(players).forEach(id => {
                    ws.send(JSON.stringify({ 
                        type: 'new_player', 
                        id: parseInt(id), 
                        color: colors[id] 
                    }));
                });
                return;
            }

            if (data.type === 'is_gamepad') {
                for (let i = 0; i < 4; i++) {
                    if (!players[i]) { playerId = i; break; }
                }
                if (playerId !== null) {
                    players[playerId] = ws;
                    ws.send(JSON.stringify({ type: 'setup', id: playerId, idVisual: playerId + 1, color: colors[playerId] }));
                    broadcast({ type: 'new_player', id: playerId, color: colors[playerId] });
                }
                return;
            }

            if (data.type === 'request_resume') {
                gameState = 'PLAYING';
                pausedBy = null;
                broadcast({ type: 'game_state', state: 'PLAYING' });
                return;
            }

            if (data.type === 'request_lobby_reset') {
                gameState = 'LOBBY';
                pausedBy = null;
                broadcast({ type: 'game_state', state: 'LOBBY' });
                return;
            }

        } catch (e) {
            if (playerId === null) return;

            if (rawMessage === 'START_PAUSE') {
                if (gameState === 'LOBBY') {
                    gameState = 'PLAYING';
                    broadcast({ type: 'game_state', state: 'PLAYING' });
                } else if (gameState === 'PLAYING') {
                    gameState = 'PAUSED';
                    pausedBy = playerId;
                    broadcast({ type: 'game_state', state: 'PAUSED', pausedBy: playerId });
                }
                return;
            }

            if (rawMessage === 'JUMP' && gameState === 'PAUSED' && playerId === pausedBy) {
                broadcast({ type: 'cmd', id: playerId, command: 'CONFIRM_MENU', pausedBy });
                return;
            }

            broadcast({ type: 'cmd', id: playerId, command: rawMessage, pausedBy });
        }
    });

    ws.on('close', () => {
        if (playerId !== null) {
            delete players[playerId];
            broadcast({ type: 'remove_player', id: playerId });
            if (Object.keys(players).length === 0) {
                gameState = 'LOBBY';
                broadcast({ type: 'game_state', state: 'LOBBY' });
            }
        }
    });
});

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(msg); });
}

server.listen(3000, '0.0.0.0', () => console.log(`🚀 Servidor en http://${localIP}:3000`));