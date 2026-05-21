import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function Gamepad() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState('Gamepad Listo');
  const [myColor, setMyColor] = useState('#fff');
  const [ipInput, setIpInput] = useState('');
  
  // Guardamos nuestro ID de jugador asignado por el servidor
  const playerID = useRef<number | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
  }, []);

  // Función de envío modificada para incluir nuestro ID
  const send = (cmd: string) => {
    if (ws.current?.readyState === WebSocket.OPEN && playerID.current !== null) {
      // Enviamos un JSON para que el servidor y el juego sepan quién habla
      ws.current.send(JSON.stringify({ 
        id: playerID.current, 
        command: cmd 
      }));
    }
  };

  const connectToServer = (url: string) => {
    setConnecting(true);
    setShowScanner(false);
    
    // Asegurarse de que la URL apunte al endpoint /ws de Elysia
    const socketUrl = url.includes('/ws') ? url : `${url}/ws`;
    
    if (ws.current) ws.current.close();
    ws.current = new WebSocket(socketUrl);

    ws.current.onopen = () => {
      // Identificarse como gamepad ante Elysia
      ws.current?.send(JSON.stringify({ type: 'is_gamepad' }));
      setConnecting(false);
      setScanned(true);
      setStatus('Sincronizando...');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Configuración inicial que envía el servidor Elysia
        if (data.type === 'setup') {
          playerID.current = data.id; // Guardamos el ID (0, 1, 2 o 3)
          setMyColor(data.color || '#4ade80');
          setStatus(`Jugador ${data.idVisual}`);
        }

        if (data.type === 'server_reset') {
          handleDisconnect();
          Alert.alert("Juego Reiniciado", "El monitor se ha reiniciado.");
        }
      } catch (e) {
        console.log("Mensaje no procesado:", event.data);
      }
    };

    ws.current.onerror = () => {
      setConnecting(false);
      setScanned(false);
      Alert.alert("Error", "No se pudo conectar. ¿El server está en el puerto 3000?");
    };

    ws.current.onclose = () => handleDisconnect();
  };

  const handleDisconnect = () => {
    setScanned(false);
    playerID.current = null;
    setStatus('Desconectado');
  };

  // --- INTERFAZ (Mantenemos tu diseño original que es excelente) ---

  if (!scanned && !showScanner && !connecting) {
    return (
      <View style={styles.lobby}>
        <Text style={styles.title}>PICO PARK</Text>
        <TouchableOpacity style={styles.mainBtn} onPress={async () => {
          const { granted } = await requestPermission();
          if (granted) setShowScanner(true);
          else Alert.alert("Permiso denegado", "Cámara necesaria para QR.");
        }}>
          <Text style={styles.mainBtnText}>ESCANEAR QR</Text>
        </TouchableOpacity>
        
        <Text style={styles.orText}>O INGRESA LA IP MANUALMENTE:</Text>
        <View style={styles.ipContainer}>
          <TextInput
            style={styles.ipInput}
            placeholder="Ej: 192.168.0.10"
            placeholderTextColor="#94a3b8"
            value={ipInput}
            onChangeText={(text) => setIpInput(text.replace(/[^0-9.]/g, ''))}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.connectIpBtn} 
            onPress={() => {
              if (ipInput.trim() !== '') connectToServer(`ws://${ipInput.trim()}:3000`);
            }}
          >
            <Text style={styles.mainBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showScanner) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView 
          style={StyleSheet.absoluteFillObject} 
          onBarcodeScanned={({ data }) => connectToServer(data)} 
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => setShowScanner(false)}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>← VOLVER</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (connecting) {
    return (
      <View style={styles.lobby}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: 'white', marginTop: 10 }}>Conectando al Intermediario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.gamepadContainer}>
      {/* DPAD */}
      <View style={styles.dpadSection}>
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <View style={styles.emptyCell} />
            <TouchableOpacity onPress={() => send('UP')} style={styles.dpadBtn}>
              <Text style={styles.arrowText}>▲</Text>
            </TouchableOpacity>
            <View style={styles.emptyCell} />
          </View>
          <View style={styles.gridRow}>
            <TouchableOpacity onPressIn={() => send('LEFT_START')} onPressOut={() => send('LEFT_STOP')} style={styles.dpadBtn}>
              <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>
            <View style={styles.emptyCell} /> 
            <TouchableOpacity onPressIn={() => send('RIGHT_START')} onPressOut={() => send('RIGHT_STOP')} style={styles.dpadBtn}>
              <Text style={styles.arrowText}>▶</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.emptyCell} />
            <TouchableOpacity onPress={() => send('DOWN')} style={styles.dpadBtn}>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
            <View style={styles.emptyCell} />
          </View>
        </View>
      </View>

      {/* INFO Y PAUSA */}
      <View style={styles.centerSection}>
        <Text style={[styles.statusText, { color: myColor }]}>{status}</Text>
        <TouchableOpacity onPress={() => send('START_PAUSE')} style={styles.startPauseBtn}>
          <Text style={styles.startPauseText}>START / PAUSA</Text>
        </TouchableOpacity>
      </View>

      {/* SALTO */}
      <View style={styles.jumpSection}>
        <TouchableOpacity onPressIn={() => send('JUMP')} style={styles.jumpBtn}>
          <Text style={styles.jumpText}>SALTAR</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Mantén tus estilos (styles) tal cual los tenías, están perfectos.
const styles = StyleSheet.create({
  lobby: { flex: 1, backgroundColor: '#000080', justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 60, fontWeight: 'bold', marginBottom: 20 },
  mainBtn: { backgroundColor: '#ef4444', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 },
  mainBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  orText: { color: 'white', marginTop: 30, marginBottom: 10, fontSize: 14, fontWeight: 'bold', opacity: 0.8 },
  ipContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  ipInput: { backgroundColor: '#1e293b', color: 'white', padding: 15, borderRadius: 10, width: 200, textAlign: 'center' },
  connectIpBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10 },
  gamepadContainer: { flex: 1, backgroundColor: '#0f172a', flexDirection: 'row', alignItems: 'center' },
  dpadSection: { flex: 1.5, alignItems: 'center', justifyContent: 'center' },
  gridContainer: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center' },
  gridRow: { flexDirection: 'row' },
  dpadBtn: { width: 100, height: 80, backgroundColor: '#334155', borderRadius: 15, justifyContent: 'center', alignItems: 'center', margin: 5, borderWidth: 3, borderColor: '#475569' },
  emptyCell: { width: 25, height: 95 },
  centerSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontWeight: 'bold', fontSize: 24, marginBottom: 40, textTransform: 'uppercase' },
  startPauseBtn: { backgroundColor: '#22c55e', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30 },
  startPauseText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  jumpSection: { flex: 1.5, alignItems: 'center', justifyContent: 'center' },
  jumpBtn: { width: 140, height: 140, backgroundColor: '#ef4444', borderRadius: 70, justifyContent: 'center', alignItems: 'center', borderWidth: 5, borderColor: '#b91c1c' },
  arrowText: { color: 'white', fontSize: 40 },
  jumpText: { color: 'white', fontWeight: 'bold', fontSize: 24 },
  backBtn: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.8)', padding: 15, borderRadius: 10 }
});