import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function Gamepad() {
// 1. Declaramos los estados (esto es lo que te falta)
  const [status, setStatus] = useState('Conectando...');
  const [playerNumber, setPlayerNumber] = useState<number | null>(null); // <--- ESTA ES LA QUE TE PIDE
  const [myColor, setMyColor] = useState('#fff'); // Para guardar el color del server
  
  // Referencia para el WebSocket
  const ws = useRef<WebSocket | null>(null);

useEffect(() => {
    // 1. Intentar bloquear orientación (si falla, no pasa nada)
    const lockOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
      } catch (e) {
        console.log("PC detectada: No se puede bloquear orientación.");
      }
    };
    lockOrientation();

    // 2. Conectar al servidor
    const serverIP = 'localhost'; 
    const socket = new WebSocket(`ws://${serverIP}:3000`);
    ws.current = socket;

    socket.onopen = () => {
      console.log("✅ Conexión física establecida");
      // 🔑 ENVIAR ESTO ES LO MÁS IMPORTANTE
      const identificacion = JSON.stringify({ type: 'is_gamepad' });
      socket.send(identificacion);
      console.log("📨 Solicitud de ID enviada al servidor");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Datos recibidos en el Gamepad:", data);

        // Si el servidor nos manda la configuración inicial
        if (data.type === 'setup') {
          console.log("✅ Configuración de jugador recibida correctamente");
          
          // ESTO es lo que cambia el texto de "Conectando..." a "Jugador X"
          setPlayerNumber(data.idVisual);
          setMyColor(data.color);
          setStatus(`Jugador ${data.idVisual}`); 
        }
      } catch (e) {
        // Aquí caen los mensajes que no son JSON (movimientos de otros jugadores)
        // No hacemos nada para no llenar la consola
      }
    };

    socket.onclose = () => setStatus('Desconectado');

    return () => {
      socket.close();
    };
  }, []);

const sendCommand = (command: string) => {
  if (ws.current?.readyState === WebSocket.OPEN) {
    // Mandamos el texto plano como antes, el servidor se encarga de empaquetarlo
    ws.current.send(command); 
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: myColor, fontSize: 24, fontWeight: 'bold' }}>{status}</Text>
        <View style={{ width: 20, height: 20, backgroundColor: myColor, borderRadius: 10, marginTop: 5 }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <TouchableOpacity 
            onPressIn={() => sendCommand('LEFT_START')} 
            onPressOut={() => sendCommand('LEFT_STOP')}
            style={{ width: 100, height: 100, backgroundColor: '#334155', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontSize: 40 }}>◀</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPressIn={() => sendCommand('RIGHT_START')} 
            onPressOut={() => sendCommand('RIGHT_STOP')}
            style={{ width: 100, height: 100, backgroundColor: '#334155', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontSize: 40 }}>▶</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => sendCommand('JUMP')}
          style={{ width: 120, height: 120, backgroundColor: '#ef4444', borderRadius: 60, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>SALTAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}