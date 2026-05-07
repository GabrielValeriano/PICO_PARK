import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
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
  
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
  }, []);

  const send = (cmd: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) ws.current.send(cmd);
  };

  const connectToServer = (url: string) => {
    setConnecting(true);
    setShowScanner(false);
    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: 'is_gamepad' }));
      setConnecting(false);
      setScanned(true);
      setStatus('Conectado');
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'setup') {
        setMyColor(data.color);
        setStatus(`Jugador ${data.idVisual}`);
      }
    };
    ws.current.onerror = () => {
      setStatus('Error de conexión. Verifica la IP.');
      setConnecting(false);
      setScanned(false);
    };
  };

  if (!scanned && !showScanner && !connecting) {
    return (
      <View style={styles.lobby}>
        <Text style={styles.title}>GAMEPAD</Text>
        <TouchableOpacity style={styles.mainBtn} onPress={async () => {
          const { granted } = await requestPermission();
          if (granted) setShowScanner(true);
        }}><Text style={styles.mainBtnText}>ESCANEAR QR</Text></TouchableOpacity>
        <Text style={styles.orText}>O INGRESA LA IP MANUALMENTE:</Text>
        <View style={styles.ipContainer}>
          <TextInput
            style={styles.ipInput}
            placeholder="Ej: 192.168.0.10"
            placeholderTextColor="#94a3b8"
            value={ipInput}
            onChangeText={(text) => setIpInput(text.replace(/[^0-9.]/g, ''))}
            keyboardType="default"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.connectIpBtn} onPress={() => {
            if (ipInput.trim() !== '') connectToServer(`ws://${ipInput.trim()}:3000`);
          }}><Text style={styles.mainBtnText}>CONECTAR</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showScanner) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={({ data }) => connectToServer(data)} />
        <TouchableOpacity style={styles.backBtn} onPress={() => setShowScanner(false)}><Text style={{ color: 'white' }}>← VOLVER</Text></TouchableOpacity>
      </View>
    );
  }

  if (connecting) {
    return (
      <View style={styles.lobby}><ActivityIndicator size="large" color="white" /><Text style={{ color: 'white', marginTop: 10 }}>Conectando...</Text></View>
    );
  }

  return (
    <SafeAreaView style={styles.gamepadContainer}>
      
      {/* SECCIÓN D-PAD (Lado Izquierdo con Grid Simétrico) */}
      <View style={styles.dpadSection}>
        <View style={styles.gridContainer}>
          {/* Fila 1: Arriba */}
          <View style={styles.gridRow}>
            <View style={styles.emptyCell} />
            <TouchableOpacity onPress={() => send('UP')} style={styles.dpadBtn}>
              <Text style={styles.arrowText}>▲</Text>
            </TouchableOpacity>
            <View style={styles.emptyCell} />
          </View>

          {/* Fila 2: Izquierda - Centro Vacío - Derecha */}
          <View style={styles.gridRow}>
            <TouchableOpacity 
              onPressIn={() => send('LEFT_START')} 
              onPressOut={() => send('LEFT_STOP')} 
              style={styles.dpadBtn}
            >
              <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>
            <View style={styles.emptyCell} /> 
            <TouchableOpacity 
              onPressIn={() => send('RIGHT_START')} 
              onPressOut={() => send('RIGHT_STOP')} 
              style={styles.dpadBtn}
            >
              <Text style={styles.arrowText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Fila 3: Abajo */}
          <View style={styles.gridRow}>
            <View style={styles.emptyCell} />
            <TouchableOpacity onPress={() => send('DOWN')} style={styles.dpadBtn}>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
            <View style={styles.emptyCell} />
          </View>
        </View>
      </View>

      {/* SECCIÓN CENTRAL */}
      <View style={styles.centerSection}>
        <Text style={[styles.statusText, { color: myColor }]}>{status}</Text>
        <TouchableOpacity onPress={() => send('START_PAUSE')} style={styles.startPauseBtn}>
          <Text style={styles.startPauseText}>START / PAUSA</Text>
        </TouchableOpacity>
      </View>

      {/* SECCIÓN DERECHA */}
      <View style={styles.jumpSection}>
        <TouchableOpacity onPress={() => send('JUMP')} style={styles.jumpBtn}>
          <Text style={styles.jumpText}>SALTAR</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Lobby e IP inputs
  lobby: { flex: 1, backgroundColor: '#000080', justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 50, fontWeight: 'bold', marginBottom: 20 },
  mainBtn: { backgroundColor: '#ef4444', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15 },
  mainBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  orText: { color: 'white', marginTop: 30, marginBottom: 10, fontSize: 16, fontWeight: 'bold' },
  ipContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  ipInput: { backgroundColor: '#1e293b', color: 'white', padding: 15, borderRadius: 10, width: 220, fontSize: 18, textAlign: 'center' },
  connectIpBtn: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10 },
  
  // Gamepad Layout
  gamepadContainer: { flex: 1, backgroundColor: '#0f172a', flexDirection: 'row', alignItems: 'center' },
  
  // --- D-PAD Grid Simétrico ---
  dpadSection: { flex: 1.2, alignItems: 'center', justifyContent: 'center' },
  gridContainer: {
    width: 210, // 3 botones de 70px
    height: 210,
  },
  gridRow: {
    flexDirection: 'row',
    height: 70,
  },
  dpadBtn: {
    width: 70,
    height: 70,
    backgroundColor: '#334155',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  emptyCell: {
    width: 70,
    height: 70,
  },

  // Centro
  centerSection: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusText: { fontWeight: 'bold', fontSize: 20, marginBottom: 80, textTransform: 'uppercase' },
  startPauseBtn: { backgroundColor: '#22c55e', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 10 },
  startPauseText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  
  // Derecha
  jumpSection: { flex: 1.2, alignItems: 'center', justifyContent: 'center' },
  jumpBtn: { width: 130, height: 130, backgroundColor: '#ef4444', borderRadius: 65, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  // Textos
  arrowText: { color: 'white', fontSize: 35 },
  jumpText: { color: 'white', fontWeight: 'bold', fontSize: 22 },
  backBtn: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 15, borderRadius: 10 }
});