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

wss.on('connection', (ws, req) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress).replace('::ffff:', '');
    let playerId = null;
    
    console.log(`\n🔌 Nueva conexión detectada desde: ${ip}`);

    ws.on('message', (message) => {
        const rawMessage = message.toString();
        console.log(`📩 Mensaje recibido de ${ip}: "${rawMessage}"`);

        try {
            const data = JSON.parse(rawMessage);

            if (data.type === 'is_game') {
                ws.isGame = true;
                console.log(`🖥️  Confirmado: Es el Monitor del Juego.`);
                return;
            }

            if (data.type === 'is_gamepad') {
                console.log(`🎮 Un dispositivo pide ser Gamepad...`);
                // Buscamos lugar
                for (let i = 0; i < 4; i++) {
                    if (!players[i]) { playerId = i; break; }
                }

                if (playerId !== null) {
                    players[playerId] = ws;
                    const idVisual = playerId + 1;
                    const setupData = { type: 'setup', id: playerId, idVisual: idVisual, color: colors[playerId] };
                    
                    ws.send(JSON.stringify(setupData));
                    broadcast({ type: 'new_player', id: playerId, color: colors[playerId] });
                    
                    console.log(`✅ ASIGNADO: Jugador ${idVisual} (IP: ${ip})`);
                } else {
                    console.log(`🚫 Servidor lleno, no hay lugar para el Gamepad.`);
                }
                return;
            }
        } catch (e) {
            // Si no es JSON, es un comando de movimiento (LEFT, RIGHT, etc)
            if (playerId !== null) {
                broadcast({ type: 'cmd', id: playerId, command: rawMessage });
            } else {
                console.log(`⚠️ Mensaje ignorado (No es JSON y no tiene ID asignado): ${rawMessage}`);
            }
        }
    });

    ws.on('close', () => {
        if (playerId !== null) {
            delete players[playerId];
            broadcast({ type: 'remove_player', id: playerId });
            console.log(`❌ Jugador ${playerId + 1} se desconectó.`);
        } else {
            console.log(`👋 Una conexión sin ID se cerró.`);
        }
    });
});

function broadcast(data) {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
}

server.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Servidor con rastro de IP corriendo en puerto 3000');
});