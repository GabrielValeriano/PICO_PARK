import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function Gamepad() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState('Gamepad Listo');
  const [myColor, setMyColor] = useState('#fff');
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
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'setup') {
        setMyColor(data.color);
        setStatus(`Jugador ${data.idVisual}`);
      }
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
      </View>
    );
  }

  if (showScanner) {
    return (
      <View style={{flex: 1}}>
        <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={({data}) => connectToServer(data)} />
        <TouchableOpacity style={styles.backBtn} onPress={() => setShowScanner(false)}><Text style={{color: 'white'}}>← VOLVER</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.gamepadContainer}>
      <View style={styles.menuControls}>
        <TouchableOpacity onPress={() => send('UP')} style={styles.menuBtn}><Text style={styles.arrowText}>▲</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => send('DOWN')} style={styles.menuBtn}><Text style={styles.arrowText}>▼</Text></TouchableOpacity>
      </View>

      <View style={styles.centerContainer}>
        <Text style={{ color: myColor, fontWeight: 'bold' }}>{status}</Text>
        <TouchableOpacity onPress={() => send('START_PAUSE')} style={styles.startPauseBtn}><Text style={styles.startPauseText}>START / PAUSA</Text></TouchableOpacity>
        <View style={styles.dpad}>
          <TouchableOpacity onPressIn={() => send('LEFT_START')} onPressOut={() => send('LEFT_STOP')} style={styles.roundBtn}><Text style={styles.arrowText}>◀</Text></TouchableOpacity>
          <TouchableOpacity onPressIn={() => send('RIGHT_START')} onPressOut={() => send('RIGHT_STOP')} style={styles.roundBtn}><Text style={styles.arrowText}>▶</Text></TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => send('JUMP')} style={styles.jumpBtn}><Text style={styles.jumpText}>SALTAR</Text></TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lobby: { flex: 1, backgroundColor: '#000080', justifyContent: 'center', alignItems: 'center' },
  title: { color: 'white', fontSize: 50, fontWeight: 'bold', marginBottom: 20 },
  mainBtn: { backgroundColor: '#ef4444', padding: 20, borderRadius: 10 },
  mainBtnText: { color: 'white', fontWeight: 'bold' },
  gamepadContainer: { flex: 1, backgroundColor: '#0f172a', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  menuControls: { gap: 15 },
  menuBtn: { width: 70, height: 70, backgroundColor: '#475569', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  centerContainer: { alignItems: 'center', gap: 10 },
  startPauseBtn: { backgroundColor: '#22c55e', padding: 12, borderRadius: 5 },
  startPauseText: { color: 'white', fontWeight: 'bold' },
  dpad: { flexDirection: 'row', gap: 20 },
  roundBtn: { width: 80, height: 80, backgroundColor: '#334155', borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  jumpBtn: { width: 120, height: 120, backgroundColor: '#ef4444', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  arrowText: { color: 'white', fontSize: 35 },
  jumpText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  backBtn: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }
});