import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function Gamepad() {
  const [status, setStatus] = useState('Conectando...');
  const [myColor, setMyColor] = useState('#333');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);

    // RECUERDA CAMBIAR LOCALHOST POR TU IP SI USAS EL CELULAR
    ws.current = new WebSocket('ws://localhost:3000'); 

    ws.current.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'setup') {
      setMyColor(data.color);
      setStatus(`Jugador ${data.idVisual} - Conectado`); // Ahora dirá 1, 2, 3 o 4
      }
    };

    ws.current.onopen = () => setStatus('Esperando ID...');
    ws.current.onclose = () => setStatus('Desconectado');

    return () => ws.current?.close();
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