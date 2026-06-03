import { Elysia } from 'elysia'
import os from 'os'

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        const ifaceList = interfaces[name];
        if (!ifaceList) continue;
        for (const iface of ifaceList) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();

interface Player {
    id: number;
    socket: any;
}

let players: Record<string, Player | undefined> = {};

const app = new Elysia()
    .ws('/ws', {
        open(ws) {
            console.log('📡 Intento de conexión');
        },
        message(ws, message: any) {
            try {
                const data = typeof message === 'string' ? JSON.parse(message) : message;
                
                // CORRECCIÓN: En vez de borrar, re-sincroniza los mandos existentes con la pantalla
                // CORRECCIÓN DEFINITIVA: Sincroniza la pantalla Y resetea los celulares al estado de Lobby
                if (data.type === 'RESET_SERVER_PLAYERS') {
                    // 1. Le avisa a la pantalla qué jugadores siguen estando
                    Object.values(players).forEach(p => {
                        if (p) ws.send({ type: 'new_player', id: p.id });
                    });
                    
                    // 2. NUEVO: Le manda una orden a los celulares para que vuelvan a mostrar el botón de START
                    Object.values(players).forEach(p => {
                        if (p && p.socket) {
                            p.socket.send(JSON.stringify({ type: 'setup', id: p.id, idVisual: p.id + 1 }));
                        }
                    });
                    
                    console.log("🔄 Lobby y celulares synchronized en punto cero.");
                    return;
                }

                if (data.type === 'is_game') {
                    ws.subscribe('pico-park');
                    ws.send({ type: 'server_info', ip: localIP });
                    Object.values(players).forEach(p => {
                        if (p) ws.send({ type: 'new_player', id: p.id });
                    });
                    return;
                }

                if (data.type === 'is_gamepad') {
                    ws.subscribe('pico-park');
                    const ocupados = Object.values(players).filter((p): p is Player => !!p).map(p => p.id);
                    let assignedId = null;
                    for (let i = 0; i < 4; i++) {
                        if (!ocupados.includes(i)) { assignedId = i; break; }
                    }

                    if (assignedId !== null) {
                        players[ws.id] = { id: assignedId, socket: ws };
                        ws.send({ type: 'setup', id: assignedId, idVisual: assignedId + 1 });
                        app.server?.publish('pico-park', JSON.stringify({ type: 'new_player', id: assignedId }));
                    }
                    return;
                }

                const currentPlayer = players[ws.id];
                if (currentPlayer) {
                    app.server?.publish('pico-park', JSON.stringify({ ...data, id: currentPlayer.id }));
                }
            } catch (e) { console.error("Error en socket"); }
        },
        close(ws) {
            const player = players[ws.id];
            if (player) {
                const removedId = player.id;
                delete players[ws.id];
                app.server?.publish('pico-park', JSON.stringify({ type: 'remove_player', id: removedId }));
                console.log(`❌ Jugador ${removedId + 1} desconectado`);
            }
        }
    })
    // 👈 CAMBIO ACÁ: Forzamos port y hostname para abrir el servidor a la red local
    .listen({ port: 3000, hostname: '0.0.0.0' }, () => {
        console.log(`🚀 SERVER EN RUNNING EN http://${localIP}:3000`);
    });